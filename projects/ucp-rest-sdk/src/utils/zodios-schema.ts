import type { ZodType } from 'zod';
import { z } from 'zod';

/** Zodios endpoint definition type */
export type EndpointDef = {
  parameters: Array<{ name?: string; type: string; schema: unknown }>;
  response?: ZodType;
};

/** Zodios instance api type (for passing to schema getters) */
export type ZodiosApi = { api: EndpointDef[] };

function getEndpoint(zodiosApi: ZodiosApi, endpointIndex: number) {
  const endpoint = zodiosApi.api[endpointIndex];
  if (!endpoint) {
    throw new Error(`Endpoint at index ${endpointIndex} not found`);
  }
  return endpoint;
}

/**
 * Get request (body) schema for the specified endpoint.
 * Returns undefined when the endpoint has no Body parameter (e.g. GET, POST with no body).
 */
export function getRequestSchema(
  zodiosApi: ZodiosApi,
  endpointIndex = 0,
): ZodType | undefined {
  const endpoint = getEndpoint(zodiosApi, endpointIndex);
  const bodyParam = endpoint.parameters.find((p) => p.type === 'Body') as
    | { schema: ZodType }
    | undefined;
  return bodyParam?.schema;
}

/**
 * Get response schema for the specified endpoint.
 */
export function getResponseSchema(
  zodiosApi: ZodiosApi,
  endpointIndex = 0,
): ZodType {
  const endpoint = getEndpoint(zodiosApi, endpointIndex);
  const responseSchema = endpoint.response;
  if (!responseSchema) {
    throw new Error(
      `Endpoint at index ${endpointIndex} has no response schema`,
    );
  }
  return responseSchema;
}

/**
 * Get headers schema for the specified endpoint.
 */
export function getHeadersSchema(
  zodiosApi: ZodiosApi,
  endpointIndex = 0,
): z.ZodObject<Record<string, ZodType>> {
  const endpoint = getEndpoint(zodiosApi, endpointIndex);
  const headerParams = endpoint.parameters.filter(
    (p) => p.type === 'Header',
  ) as Array<{ name: string; schema: ZodType }>;
  return z.object(
    Object.fromEntries(headerParams.map((p) => [p.name, p.schema])),
  ) as z.ZodObject<Record<string, ZodType>>;
}
