import { type Context } from 'hono';
import { Stripe } from 'stripe';

import { type PaymentArgs } from '../types/payment.js';
import { streamSSE } from 'hono/streaming';
import { resultState, setResult } from './state.js';

const stripeApiKey: string = process.env.STRIPE_API_KEY ?? '';

export async function payment(c: Context) {
  const body = await c.req.json<PaymentArgs>();
  const payment_token: string = JSON.parse(body.payment_token).id;
  const amount: number = body.amount;
  const currency: string = body.currency;

  const stripe: Stripe = new Stripe(stripeApiKey);

  // GPay 支払いトークンにてpayment method を作成
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      token: payment_token,
    },
  });

  // 決済の実行
  const paymentIntents = await stripe.paymentIntents.create({
    amount: amount,
    currency: currency,
    payment_method: paymentMethod.id,
    confirm: true,
    // automatic_payment_methods: {
    //   enabled: true,
    //   allow_redirects: 'never',
    // }
  });

  // 作成したpayment intents を返す
  return c.json(paymentIntents);
}

export async function webhooks(c: Context) {
  const stripe: Stripe = new Stripe(stripeApiKey);

  // 1) raw body をそのまま取得（ここが最重要）
  const payload = await c.req.raw.text();

  // 2) Stripe-Signature ヘッダー取得
  const sig = c.req.header('stripe-signature');
  if (!sig) {
    return c.text('Missing Stripe-Signature header', 400);
  }

  // 3) 署名検証してイベント復元
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_SIGNING_SECRET ?? '',
    );
  } catch (err: any) {
    // 署名が合わない/改ざんなど
    return c.text(`Webhook Error: ${err.message}`, 400);
  }

  // 4) イベント種別ごとに処理
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent;

      // 例: 注文確定・権限付与・配送開始など
      // pi.id, pi.amount, pi.currency, pi.metadata などを使える
      console.log('✅ PaymentIntent succeeded:', pi.id);

      setResult(event.type);

      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log(
        '❌ PaymentIntent failed:',
        pi.id,
        pi.last_payment_error?.message,
      );

      // 例: 支払い失敗通知・再試行導線など
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  // 5) Stripe には早めに 2xx を返す（重い処理はキュー推奨）
  return c.json({ received: true });
}

export function sse(c: Context) {
  let id = 0;

  return streamSSE(c, async (stream) => {
    let aborted = false;
    stream.onAbort(() => {
      aborted = true;
      console.log('SSE aborted');
    });

    // 最後に送った version を覚えておく
    let lastVersion = -1;

    // keep-alive 用（pingを送った時刻）
    let lastPing = Date.now();

    // 接続直後に1回送る（JSONで統一するとフロントが楽）
    await stream.writeSSE({
      event: 'message',
      data: JSON.stringify({ status: 'connected' }),
      id: '0',
    });

    while (!aborted) {
      // 共有ストアの変化を監視
      if (resultState.version !== lastVersion) {
        console.log(resultState);
        lastVersion = resultState.version;

        await stream.writeSSE({
          event: 'message',
          data: JSON.stringify({
            value: resultState.value,
            updatedAt: resultState.updatedAt,
            version: resultState.version,
          }),
          id: String(resultState.version),
        });
      }

      // 無通信が続くと切れやすいので pingを送る
      if (Date.now() - lastPing > 15000) {
        await stream.write(`ping ${Date.now()}\n\n`);
        lastPing = Date.now();
      }

      await stream.sleep(500);
    }
  });
}
