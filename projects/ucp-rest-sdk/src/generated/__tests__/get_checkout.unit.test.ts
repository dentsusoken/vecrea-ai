import { describe, expect, test } from 'vitest';
import { Get_checkoutApi } from '../get_checkout';
import {
  getResponseSchema,
  getHeadersSchema,
  type ZodiosApi,
} from '../../utils/zodios-schema';

const responseSchema = getResponseSchema(Get_checkoutApi as ZodiosApi);
const headersSchema = getHeadersSchema(Get_checkoutApi as ZodiosApi);

const validResponse = {
  ucp: { version: '2026-01-23', payment_handlers: {} },
  id: 'test-checkout-id',
  line_items: [
    {
      id: 'line-1',
      item: { id: 'item-1', title: 'Test Item', price: 1000 },
      quantity: 1,
      totals: [
        { type: 'subtotal' as const, amount: 1000 },
        { type: 'total' as const, amount: 1000 },
      ],
    },
  ],
  links: [{ type: 'continue', url: 'https://example.com/continue' }],
  status: 'ready_for_complete' as const,
  currency: 'JPY',
  totals: [
    { type: 'subtotal' as const, amount: 1000 },
    { type: 'total' as const, amount: 1000 },
  ],
};

const validHeaders = {
  'Request-Signature': 'mock-signature',
  'Request-Id': '00000000-0000-0000-0000-000000000002',
  'UCP-Agent': 'profile=https://platform.example/profile',
};

describe('get_checkout response Zod validation', () => {
  test('valid response passes validation', () => {
    const result = responseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-checkout-id');
      expect(result.data.status).toBe('ready_for_complete');
    }
  });

  test('invalid response (missing required fields) fails validation', () => {
    const result = responseSchema.safeParse({ id: 'only-id' });
    expect(result.success).toBe(false);
  });

  test.each([
    {
      name: 'line_items[].item.price is negative',
      response: {
        ...validResponse,
        line_items: [
          {
            id: 'x',
            item: { id: 'y', title: 'z', price: -1 },
            quantity: 1,
            totals: [{ type: 'total' as const, amount: 1000 }],
          },
        ],
      },
    },
    {
      name: 'status is not in enum',
      response: { ...validResponse, status: 'invalid_status' },
    },
    {
      name: 'links[].url is not URL format',
      response: {
        ...validResponse,
        links: [{ type: 'continue', url: 'not-a-url' }],
      },
    },
    {
      name: 'ucp.version is not date format',
      response: {
        ...validResponse,
        ucp: { version: 'invalid', payment_handlers: {} },
      },
    },
    {
      name: 'line_items[].quantity is 0',
      response: {
        ...validResponse,
        line_items: [
          {
            id: 'line-1',
            item: { id: 'item-1', title: 'Test', price: 1000 },
            quantity: 0,
            totals: [
              { type: 'subtotal' as const, amount: 1000 },
              { type: 'total' as const, amount: 1000 },
            ],
          },
        ],
      },
    },
    {
      name: 'totals[].amount is negative',
      response: {
        ...validResponse,
        totals: [
          { type: 'subtotal' as const, amount: -100 },
          { type: 'total' as const, amount: 1000 },
        ],
      },
    },
  ])(
    'invalid response (type error: $name) fails validation',
    ({ response }) => {
      const result = responseSchema.safeParse(response);
      expect(result.success).toBe(false);
    },
  );
});

describe('get_checkout header Zod validation', () => {
  test('valid headers pass validation', () => {
    const result = headersSchema.safeParse(validHeaders);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data['Request-Signature']).toBe('mock-signature');
      expect(result.data['Request-Id']).toBe(validHeaders['Request-Id']);
    }
  });

  test('missing required headers fail validation', () => {
    const result = headersSchema.safeParse({
      'Request-Signature': 'sig',
    });
    expect(result.success).toBe(false);
  });

  test.each([
    {
      name: 'Request-Id is not UUID format',
      headers: { ...validHeaders, 'Request-Id': 'not-a-uuid' },
    },
    {
      name: 'Request-Signature is number (type error)',
      headers: { ...validHeaders, 'Request-Signature': 123 },
    },
    {
      name: 'Request-Id is number (type error)',
      headers: {
        ...validHeaders,
        'Request-Id': 123,
      },
    },
  ])('invalid headers (type error: $name) fail validation', ({ headers }) => {
    const result = headersSchema.safeParse(headers);
    expect(result.success).toBe(false);
  });
});
