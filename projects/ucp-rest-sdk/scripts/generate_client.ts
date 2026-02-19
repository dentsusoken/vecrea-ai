/**
 * OpenAPI から Zod クライアントを生成するスクリプト。
 * UCP Github リポジトリから2026-01-23 の OpenAPI を使用してクライアントを生成する。
 * ucp.dev で公開されている OpenAPI は、2026-01-11 のものとなっている為、Github リポジトリから取得する。
 * 生成されたクライアントは、エイリアス毎に lib/generated に保存される。
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { resolveConfig } from 'prettier';

const require = createRequire(import.meta.url);
const SwaggerParser = require('@apidevtools/swagger-parser');
const { generateZodClientFromOpenAPI, getHandlebars } =
  await import('openapi-zod-client');

const OPENAPI_URL =
  'https://raw.githubusercontent.com/Universal-Commerce-Protocol/ucp/release/2026-01-23/source/services/shopping/openapi.json';
const DEFAULT_OUTPUT_DIR = 'src/generated';
const GROUP_STRATEGY = 'tag-file';

/** tag を alias（operationId）で付与。operationId が無い場合は path_method をフォールバック */
function assignTagsByAlias(openApiDoc: {
  paths?: Record<string, Record<string, unknown>>;
}) {
  const paths = openApiDoc.paths ?? {};
  const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
  for (const pathKey of Object.keys(paths)) {
    const firstSegment = pathKey.split('/').filter(Boolean)[0] ?? 'default';
    const pathItem = paths[pathKey];
    if (!pathItem || typeof pathItem !== 'object') continue;
    for (const method of methods) {
      const op = pathItem[method] as
        | { tags?: string[]; operationId?: string }
        | undefined;
      if (!op || typeof op !== 'object') continue;
      if (!op.tags || op.tags.length === 0) {
        op.tags = [
          typeof op.operationId === 'string' && op.operationId.trim() !== ''
            ? op.operationId
            : `${firstSegment}_${method}`,
        ];
      }
    }
  }
}

async function main() {
  // 第1引数: 入力（ローカルパス or URL）、第2引数: 出力ディレクトリ（省略可）
  const input = process.argv[2];
  const outputPath =
    process.argv[3] ?? resolve(process.cwd(), DEFAULT_OUTPUT_DIR);
  const openApiSource = input
    ? input.startsWith('http://') || input.startsWith('https://')
      ? input
      : resolve(process.cwd(), input)
    : OPENAPI_URL;
  console.log('Retrieving OpenAPI document from', openApiSource);
  const openApiDoc = await SwaggerParser.dereference(openApiSource);
  assignTagsByAlias(openApiDoc);
  console.log('Dereferenced successfully. Generating client...');
  const distPath = resolve(process.cwd(), outputPath);
  const prettierConfig = await resolveConfig(process.cwd());
  const handlebars = getHandlebars();
  handlebars.registerHelper('endpointsVarName', (apiClientName: string) => {
    if (!apiClientName || typeof apiClientName !== 'string') return 'endpoints';
    return `${apiClientName.replace(/Api$/i, '').toLowerCase()}_endpoints`;
  });
  await generateZodClientFromOpenAPI({
    openApiDoc,
    distPath,
    handlebars,
    prettierConfig,
    options: {
      withAlias: true,
      shouldExportAllSchemas: false,
      shouldExportAllTypes: false,
      groupStrategy: GROUP_STRATEGY,
    },
  });
  console.log('Done generating under', distPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
