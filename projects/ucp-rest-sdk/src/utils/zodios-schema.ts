import type { ZodType } from 'zod';
import { z } from 'zod';

/** Zodios のエンドポイント定義の型 */
export type EndpointDef = {
  parameters: Array<{ name?: string; type: string; schema: unknown }>;
  response?: ZodType;
};

/** Zodios インスタンスが持つ api の型（getEndpointSchemas に渡す用） */
export type ZodiosApi = { api: EndpointDef[] };

/**
 * Zodios の API 定義から、指定エンドポイントの Request(Body), Response, Header のスキーマを取得する。
 * @param zodiosApi - Create_checkoutApi など Zodios インスタンス（.api を持つ）
 * @param endpointIndex - エンドポイントのインデックス（省略時は 0）
 */
export function getEndpointSchemas(
  zodiosApi: ZodiosApi,
  endpointIndex = 0,
): {
  requestSchema: ZodType;
  responseSchema: ZodType;
  headersSchema: z.ZodObject<Record<string, ZodType>>;
} {
  const api = zodiosApi.api;
  const endpoint = api[endpointIndex];
  if (!endpoint) {
    throw new Error(`Endpoint at index ${endpointIndex} not found`);
  }

  const bodyParam = endpoint.parameters.find((p) => p.type === 'Body') as
    | { schema: ZodType }
    | undefined;
  const requestSchema = bodyParam?.schema;
  if (!requestSchema) {
    throw new Error(`Endpoint at index ${endpointIndex} has no Body parameter`);
  }

  const responseSchema = endpoint.response;
  if (!responseSchema) {
    throw new Error(
      `Endpoint at index ${endpointIndex} has no response schema`,
    );
  }

  const headerParams = endpoint.parameters.filter(
    (p) => p.type === 'Header',
  ) as Array<{ name: string; schema: ZodType }>;
  const headersSchema = z.object(
    Object.fromEntries(headerParams.map((p) => [p.name, p.schema])),
  ) as z.ZodObject<Record<string, ZodType>>;

  return { requestSchema, responseSchema, headersSchema };
}
