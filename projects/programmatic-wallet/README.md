# Programmatic Wallet

A Wallet implementation designed for operation by AI Agents. This project provides programmatic access to wallet functionality through multiple interfaces, enabling AI-driven workflows and automation.

## Secure Signing Without Managing Private Keys

This project uses [@coinbase/cdp-core](https://www.npmjs.com/package/@coinbase/cdp-core) to enable **secure signing without managing private keys**. Instead of storing secrets locally, authentication is done via **email OTP** (One-Time Password):

- **No private key management** — You don't need to generate, store, or handle private keys in your application
- **Email OTP authentication** — When signing, a one-time code is sent to the user's email for verification
- **Secure by design** — Keys are managed by CDP; your app never touches raw secrets, reducing exposure risk

## Supported Interfaces

- **CLI** — Direct command-line usage for scripts and automation
- **AI Agents (SKILL.md)** — Integration with AI Agents using Cursor skills
- **Vercel AI SDK** — SDK integration for building AI-powered applications with the Vercel AI SDK

This project supports both **Web** and **CLI** usage. When running in Node.js (CLI), `localStorage` is emulated via [localstorage-polyfill](https://www.npmjs.com/package/localstorage-polyfill) so the CDP SDK can store tokens. In the browser, the native `window.localStorage` is used.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your CDP Project ID:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and replace `your-project-id` with your actual Project ID from the [CDP Portal](https://portal.cdp.coinbase.com).

## Usage

```bash
npx tsx src/cli.ts
```

To run other scripts, add `import "./env-shim"` at the top (before any CDP imports) so `localStorage` is polyfilled in Node:

```bash
npx tsx src/xxx.ts
```
