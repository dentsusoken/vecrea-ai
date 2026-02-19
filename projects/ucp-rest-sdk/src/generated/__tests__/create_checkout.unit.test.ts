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

  test('無効な body（型エラー）ならバリデーションに失敗する', () => {
    const result = requestSchema.safeParse({
      ...validBody,
      line_items: [
        {
          id: 'x',
          item: { id: 'y', title: 'z', price: -1 },
          quantity: 1,
          totals: [],
        },
      ],
    });
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

  test('無効なレスポンス（型エラー）ならバリデーションに失敗する', () => {
    const result = responseSchema.safeParse({
      ...validResponse,
      line_items: [
        {
          id: 'x',
          item: { id: 'y', title: 'z', price: -1 },
          quantity: 1,
          totals: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
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

  test('Idempotency-Key が UUID 形式でないならバリデーションに失敗する', () => {
    const result = headersSchema.safeParse({
      ...validHeaders,
      'Idempotency-Key': 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});
