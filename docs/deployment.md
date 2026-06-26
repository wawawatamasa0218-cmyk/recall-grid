# RecallGrid デプロイ手順

RecallGrid は以下の構成で公開する。

```txt
GitHub
  ↓
Vercel: Next.js アプリ
  ↓
Supabase: Auth / Postgres / Storage
```

## 推奨サービス

- Next.js 本体: Vercel
- Auth / DB / Storage: Supabase
- ソースコード: GitHub

## Vercel に設定する環境変数

Vercel の Project Settings > Environment Variables に以下を登録する。

```env
NEXT_PUBLIC_SUPABASE_URL=https://kemhfvnzmqxoqzkryzkp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase publishable key
NEXT_PUBLIC_APP_URL=https://recall-grid.vercel.app
SUPABASE_SERVICE_ROLE_KEY=Supabase service role key
SUPABASE_DB_PASSWORD=Supabase database password
```

`.env.local` は Git 管理しない。service role key と DB password は絶対に公開しない。

## Supabase Auth の設定

Vercel の本番 URL は以下。

```txt
https://recall-grid.vercel.app
```

Supabase Dashboard で以下を設定する。

Authentication > URL Configuration:

```txt
Site URL:
https://recall-grid.vercel.app

Redirect URLs:
https://recall-grid.vercel.app/auth/callback
https://recall-grid.vercel.app/auth/update-password
```

Google ログインを使う場合は、Supabase の Google provider と Google Cloud OAuth consent / redirect URI の設定も必要。

## デプロイ前チェック

Node.js は `>=20.9.0`。このプロジェクトでは `.nvmrc` に `22.18.0` を指定している。

```bash
npm install
npm run lint
npm test
npm run build
```

## 初回デプロイ手順

1. GitHub の `main` に push
2. Vercel project `recall-grid` を作成
3. Framework は Next.js を選択
4. Environment Variables を登録
5. Deploy
6. `NEXT_PUBLIC_APP_URL` に `https://recall-grid.vercel.app` を設定
7. Vercel で Redeploy
8. Supabase Auth の Site URL / Redirect URLs に本番URLを反映

## 公開後の確認

- `/` が開ける
- メール・パスワードで登録できる
- ログインできる
- `/dashboard` が開ける
- デッキを作成できる
- 問題を保存できる
- `/review` で出題できる
- `/explore` で公開デッキ一覧が見える
- `/share/[slug]` で公開デッキが見える
- 公開デッキをコピーできる
- パスワード再設定メールから `/auth/update-password` に戻れる

## 注意

Vercel CLI で直接デプロイする場合は、事前に以下のどちらかが必要。

- `vercel login`
- `VERCEL_TOKEN` または `vercel --token`

CLI 未ログインの場合、GitHub push までは可能だが Vercel への実デプロイは止まる。
