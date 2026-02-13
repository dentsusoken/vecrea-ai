# gpay

GPay 支払いトークンを用いたStripe 決済のサンプル。
DevContainers にて環境構築をしています。

## 事前準備

### 環境変数の登録

1. 環境変数を登録するためのファイルを作成する
    .devcontainer/.env_sample をコピーし、.devcontainer/.env を作成する
2. Stripe のシークレットキーとサインシークレットを.env に追加する
    1 で作成した.env ファイルに、下記のように環境変数を追加してください。

    - `STRIPE_API_KEY`: [Stripe のシークレットキーを取得する](#stripe-のシークレットキーを取得する) を参照
    - `STRIPE_SIGNING_SECRET`: [サインシークレットを取得する](#サインシークレットを取得する) を参照
3. `npm install` にてパッケージインストールする
    - Dev Containers にて起動させる場合は不要です。

#### Stripe のシークレットキーを取得する

1. https://dashboard.stripe.com/ にアクセスし、ダッシュボード右側に表示されているシークレットキーをSTRIPE_API_KEY に設定する

#### サインシークレットを取得する

1. 以下のコマンドを実行して出力された結果をSTRIPE_SIGNING_SECRET に設定する
    ```bash
    stripe listen --api-key ${STRIPE_API_KEY} --print-secret
    ```

## 実行方法

1. `npm run dev`にてサーバーを起動する
2. 新しいターミナルから以下のコマンドを実行し、Stripe のイベントをローカルに取得できるようにする

    ```bash
    stripe listen --forward-to http://localhost:3000/webhooks/stripe --api-key ${STRIPE_API_KEY}
    ```

3. `http://localhost:3000/`にアクセスする
4. `GPay で支払う`をクリックする
5. 表示されたダイアログの`お支払い`をクリック
6. 最終行内に`"value":"payment_intent.succeeded`が表示されればOK

## 環境変数について

- STRIPE_API_KEY: Stripe のAPI 秘密鍵
- STRIPE_SIGNING_SECRET: Stripe のWebhook イベントの署名検証を行う秘密鍵

## スクリプト

| コマンド        | 説明                 |
|----------------|----------------------|
| `npm run dev`  | 開発（tsx watch）    |
| `npm run build`| ビルド（dist 出力）  |
| `npm start`    | ビルド済みの実行     |
| `npm run typecheck` | 型チェックのみ   |

## 構成

```
gpay/
├── .devcontainer/       # DevContainers 用設定
│   ├── devcontainer.json
│   ├── docker-compose.yml
│   ├── .env_sample       # 環境変数の雛形
│   └── setup.sh
├── src/
│   ├── index.ts         # エントリーポイント
│   ├── front/           # GPay 用フロント
│   │   ├── index.html
│   │   └── main.ts
│   ├── types/           # 型定義
│   │   ├── payment.ts
│   │   └── state.ts
│   └── utils/           # Stripe 連携・状態管理
│       ├── stripe.ts
│       └── state.ts
├── .env                 # 環境変数（ローカル用・要自動作成）
├── package.json
├── tsconfig.json
├── tsconfig.front.json  # フロント用 TS ビルド設定
└── README.md
```
