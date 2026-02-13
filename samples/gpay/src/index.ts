import { type Context, Hono } from 'hono'
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static';

import { payment, sse, webhooks } from './utils/stripe.js'

const app = new Hono();

app.use('*', logger())

// GPay のボタンを表示する
app.get('/', serveStatic({ path: './src/front/index.html' }));
// GPay ボタンの設定用js を公開する (一時的)
app.use('/samples/*', serveStatic({
  root: './dist/front',
  rewriteRequestPath: (p: string) => p.replace(/^\/samples/, ''),
}));

app.get("/sse/stripe", sse);

app.post("/webhooks/stripe", webhooks);

// Stripe で決済を行うAPI を公開する
app.post('/api/payment', payment);

serve({
  fetch: app.fetch,
  port: 3000
});
