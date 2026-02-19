import { describe, expect, test } from 'vitest';
import { Create_checkoutApi } from '../create_checkout';
import { getEndpointSchemas, type ZodiosApi } from '../../utils/zodios-schema';

const { requestSchema, responseSchema, headersSchema } = getEndpointSchemas(
  Create_checkoutApi as ZodiosApi,
);

const validBody = {
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
  status: 'incomplete' as const,
  currency: 'JPY',
  totals: [
    { type: 'subtotal' as const, amount: 1000 },
    { type: 'total' as const, amount: 1000 },
  ],
  links: [{ type: 'continue', url: 'https://example.com/continue' }],
};

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
  'Idempotency-Key': '00000000-0000-0000-0000-000000000001',
  'Request-Id': '00000000-0000-0000-0000-000000000002',
  'UCP-Agent': 'profile=https://platform.example/profile',
};

describe('create_checkout リクエストボディの Zod バリデーション', () => {
  test('有効な body ならバリデーションを通過する', () => {
    const result = requestSchema.safeParse(validBody);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-checkout-id');
    }
  });

  test('無効な body（必須不足）ならバリデーションに失敗する', () => {
    const result = requestSchema.safeParse({ id: 'only-id' });
    expect(result.success).toBe(false);
  });

  test.each([
    {
      name: 'line_items[].item.price が負の数',
      body: {
        ...validBody,
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
      name: 'status が enum 外',
      body: { ...validBody, status: 'invalid_status' },
    },
    {
      name: 'links[].url が URL 形式でない',
      body: {
        ...validBody,
        links: [{ type: 'continue', url: 'not-a-url' }],
      },
    },
    {
      name: 'ucp.version が日付形式（YYYY-MM-DD）でない',
      body: {
        ...validBody,
        ucp: { version: 'invalid', payment_handlers: {} },
      },
    },
    {
      name: 'line_items[].quantity が 0',
      body: {
        ...validBody,
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
      name: 'totals[].type が enum 外',
      body: {
        ...validBody,
        totals: [
          { type: 'subtotal' as const, amount: 1000 },
          { type: 'invalid_type' as const, amount: 1000 },
        ],
      },
    },
    {
      name: 'currency が number（型違い）',
      body: { ...validBody, currency: 123 },
    },
  ])('無効な body（型エラー: $name）ならバリデーションに失敗する', ({ body }) => {
    const result = requestSchema.safeParse(body);
    expect(result.success).toBe(false);
  });
});

describe('create_checkout レスポンスの Zod バリデーション', () => {
  test('有効なレスポンスならバリデーションを通過する', () => {
    const result = responseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-checkout-id');
      expect(result.data.status).toBe('ready_for_complete');
    }
  });

  test('無効なレスポンス（必須不足）ならバリデーションに失敗する', () => {
    const result = responseSchema.safeParse({ id: 'only-id' });
    expect(result.success).toBe(false);
  });

  test.each([
    {
      name: 'line_items[].item.price が負の数',
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
      name: 'status が enum 外',
      response: { ...validResponse, status: 'invalid_status' },
    },
    {
      name: 'links[].url が URL 形式でない',
      response: {
        ...validResponse,
        links: [{ type: 'continue', url: 'not-a-url' }],
      },
    },
    {
      name: 'ucp.version が日付形式でない',
      response: {
        ...validResponse,
        ucp: { version: 'invalid', payment_handlers: {} },
      },
    },
    {
      name: 'line_items[].quantity が 0',
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
      name: 'totals[].amount が負の数',
      response: {
        ...validResponse,
        totals: [
          { type: 'subtotal' as const, amount: -100 },
          { type: 'total' as const, amount: 1000 },
        ],
      },
    },
  ])(
    '無効なレスポンス（型エラー: $name）ならバリデーションに失敗する',
    ({ response }) => {
      const result = responseSchema.safeParse(response);
      expect(result.success).toBe(false);
    },
  );
});

describe('create_checkout ヘッダーの Zod バリデーション', () => {
  test('有効なヘッダーならバリデーションを通過する', () => {
    const result = headersSchema.safeParse(validHeaders);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data['Request-Signature']).toBe('mock-signature');
      expect(result.data['Idempotency-Key']).toBe(
        validHeaders['Idempotency-Key'],
      );
    }
  });

  test('必須ヘッダー不足ならバリデーションに失敗する', () => {
    const result = headersSchema.safeParse({
      'Request-Signature': 'sig',
    });
    expect(result.success).toBe(false);
  });

  test.each([
    {
      name: 'Idempotency-Key が UUID 形式でない',
      headers: { ...validHeaders, 'Idempotency-Key': 'not-a-uuid' },
    },
    {
      name: 'Request-Id が UUID 形式でない',
      headers: { ...validHeaders, 'Request-Id': 'not-a-uuid' },
    },
    {
      name: 'Idempotency-Key が空文字',
      headers: { ...validHeaders, 'Idempotency-Key': '' },
    },
    {
      name: 'Request-Signature が number（型違い）',
      headers: { ...validHeaders, 'Request-Signature': 123 },
    },
    {
      name: 'Idempotency-Key が number（型違い）',
      headers: {
        ...validHeaders,
        'Idempotency-Key': 123,
      },
    },
  ])(
    '無効なヘッダー（型エラー: $name）ならバリデーションに失敗する',
    ({ headers }) => {
      const result = headersSchema.safeParse(headers);
      expect(result.success).toBe(false);
    },
  );
});
