# gpay

GPay 支払いトークンを用いたStripe 決済のサンプル。
DevContainers にて環境構築をしています。

## 環境変数

`.devcontainer/.env_sample` をコピーして `.devcontainer/.env` を作成し、以下の内容にて環境変数を設定して下さい
- STRIPE_API_KEY: https://dashboard.stripe.com/ からシークレットキーを取得
- STRIPE_SIGNING_SECRET: STRIPE_API_KEY を設定した後、DevContainers を起動し、`get_signing_secret`をコンソールから実行した結果

## セットアップ

環境変数の設定後にDevContainers にてこのリポジトリを開いて下さい。

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
├── src/
│   ├── index.ts      # エントリーポイント
│   ├── front/        # GPay のテンプレート
│   ├── types/        # 型定義
│   └── utils/        # ユーティリティ
├── package.json
├── tsconfig.json
├── eslint.config.js
└── .prettierrc.json
```

## 使用方法

1. `npm run dev`にてサーバーを起動する
2. ターミナルを新しく作成し、`./bin/listen_server`を実行してWebhook イベントをローカルに転送できるようにする
3. `http://localhost:3000/`にアクセスする
4. `GPay で支払う`をクリックする
5. 表示されたダイアログの`お支払い`をクリック
6. `"value":"payment_intent.succeeded`が表示されればOK
