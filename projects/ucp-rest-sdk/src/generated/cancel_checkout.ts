import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const endpoints = makeApi([
  {
    method: 'post',
    path: '/checkout-sessions/:id/cancel',
    alias: 'cancel_checkout',
    description: `Cancel a checkout session`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'Authorization',
        type: 'Header',
        schema: z.string().optional(),
      },
      {
        name: 'X-API-Key',
        type: 'Header',
        schema: z.string().optional(),
      },
      {
        name: 'Request-Signature',
        type: 'Header',
        schema: z.string(),
      },
      {
        name: 'Idempotency-Key',
        type: 'Header',
        schema: z.string().uuid(),
      },
      {
        name: 'Request-Id',
        type: 'Header',
        schema: z.string().uuid(),
      },
      {
        name: 'User-Agent',
        type: 'Header',
        schema: z.string().optional(),
      },
      {
        name: 'Content-Type',
        type: 'Header',
        schema: z.string().optional(),
      },
      {
        name: 'Accept',
        type: 'Header',
        schema: z.string().optional(),
      },
      {
        name: 'Accept-Language',
        type: 'Header',
        schema: z.string().optional(),
      },
      {
        name: 'Accept-Encoding',
        type: 'Header',
        schema: z.string().optional(),
      },
    ],
    response: z
      .object({
        ucp: z
          .object({
            version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            services: z
              .record(
                z.array(
                  z
                    .object({
                      version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                      spec: z.string().url().optional(),
                      schema: z.string().url().optional(),
                      id: z.string().optional(),
                      config: z.object({}).partial().passthrough().optional(),
                    })
                    .passthrough()
                    .and(
                      z
                        .object({
                          transport: z.enum(['rest', 'mcp', 'a2a', 'embedded']),
                          endpoint: z.string().url().optional(),
                        })
                        .passthrough()
                    )
                )
              )
              .optional(),
            capabilities: z
              .record(
                z.array(
                  z
                    .object({
                      version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                      spec: z.string().url().optional(),
                      schema: z.string().url().optional(),
                      id: z.string().optional(),
                      config: z.object({}).partial().passthrough().optional(),
                    })
                    .passthrough()
                    .and(
                      z
                        .object({
                          extends: z
                            .string()
                            .regex(/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_]*)+$/),
                        })
                        .partial()
                        .passthrough()
                    )
                )
              )
              .optional(),
            payment_handlers: z
              .record(
                z.array(
                  z
                    .object({
                      version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                      spec: z.string().url().optional(),
                      schema: z.string().url().optional(),
                      id: z.string().optional(),
                      config: z.object({}).partial().passthrough().optional(),
                    })
                    .passthrough()
                    .and(z.object({}).passthrough())
                )
              )
              .optional(),
          })
          .passthrough()
          .and(
            z
              .object({
                services: z.record(z.unknown()).optional(),
                capabilities: z.record(z.unknown()).optional(),
                payment_handlers: z.record(z.unknown()),
              })
              .passthrough()
          ),
        id: z.string(),
        line_items: z.array(
          z
            .object({
              id: z.string(),
              item: z
                .object({
                  id: z.string(),
                  title: z.string(),
                  price: z.number().int().gte(0),
                  image_url: z.string().url().optional(),
                })
                .passthrough(),
              quantity: z.number().int().gte(1),
              totals: z.array(
                z
                  .object({
                    type: z.enum([
                      'items_discount',
                      'subtotal',
                      'discount',
                      'fulfillment',
                      'tax',
                      'fee',
                      'total',
                    ]),
                    display_text: z.string().optional(),
                    amount: z.number().int().gte(0),
                  })
                  .passthrough()
              ),
              parent_id: z.string().optional(),
            })
            .passthrough()
        ),
        buyer: z
          .object({
            first_name: z.string(),
            last_name: z.string(),
            email: z.string(),
            phone_number: z.string(),
          })
          .partial()
          .passthrough()
          .optional(),
        context: z
          .object({
            address_country: z.string(),
            address_region: z.string(),
            postal_code: z.string(),
          })
          .partial()
          .passthrough()
          .optional(),
        status: z.enum([
          'incomplete',
          'requires_escalation',
          'ready_for_complete',
          'complete_in_progress',
          'completed',
          'canceled',
        ]),
        currency: z.string(),
        totals: z.array(
          z
            .object({
              type: z.enum([
                'items_discount',
                'subtotal',
                'discount',
                'fulfillment',
                'tax',
                'fee',
                'total',
              ]),
              display_text: z.string().optional(),
              amount: z.number().int().gte(0),
            })
            .passthrough()
        ),
        messages: z
          .array(
            z.union([
              z
                .object({
                  type: z.string(),
                  code: z.string(),
                  path: z.string().optional(),
                  content_type: z
                    .enum(['plain', 'markdown'])
                    .optional()
                    .default('plain'),
                  content: z.string(),
                  severity: z.enum([
                    'recoverable',
                    'requires_buyer_input',
                    'requires_buyer_review',
                  ]),
                })
                .passthrough(),
              z
                .object({
                  type: z.string(),
                  path: z.string().optional(),
                  code: z.string(),
                  content: z.string(),
                  content_type: z
                    .enum(['plain', 'markdown'])
                    .optional()
                    .default('plain'),
                })
                .passthrough(),
              z
                .object({
                  type: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                  content_type: z
                    .enum(['plain', 'markdown'])
                    .optional()
                    .default('plain'),
                  content: z.string(),
                })
                .passthrough(),
            ])
          )
          .optional(),
        links: z.array(
          z
            .object({
              type: z.string(),
              url: z.string().url(),
              title: z.string().optional(),
            })
            .passthrough()
        ),
        expires_at: z.string().datetime({ offset: true }).optional(),
        continue_url: z.string().url().optional(),
        payment: z
          .object({
            instruments: z.array(
              z
                .object({
                  id: z.string(),
                  handler_id: z.string(),
                  type: z.string(),
                  billing_address: z
                    .object({
                      extended_address: z.string(),
                      street_address: z.string(),
                      address_locality: z.string(),
                      address_region: z.string(),
                      address_country: z.string(),
                      postal_code: z.string(),
                      first_name: z.string(),
                      last_name: z.string(),
                      phone_number: z.string(),
                    })
                    .partial()
                    .passthrough()
                    .optional(),
                  credential: z
                    .object({ type: z.string() })
                    .passthrough()
                    .optional(),
                  display: z.object({}).partial().passthrough().optional(),
                })
                .passthrough()
                .and(
                  z.object({ selected: z.boolean() }).partial().passthrough()
                )
            ),
          })
          .partial()
          .passthrough()
          .optional(),
        order: z
          .object({ id: z.string(), permalink_url: z.string().url() })
          .passthrough()
          .optional(),
      })
      .passthrough(),
  },
]);

export const Cancel_checkoutApi = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
