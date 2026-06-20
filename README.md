# RecallGrid

問題をまとめて作り、その日に必要なカードだけを復習する暗記アプリの MVP です。

## セットアップ

1. Node.js 20.9 以上を使用します（nvm環境では `nvm use` で `.nvmrc` のバージョンに切り替わります）。
2. `npm install` を実行します。
3. Supabase で新しいプロジェクトを作成します。
4. Supabase の SQL Editor で `supabase/migrations/001_initial_schema.sql` を実行します。
5. `.env.example` を `.env.local` にコピーし、Project URL と anon key を設定します。
6. Authentication の Site URL を `http://localhost:3000` に設定します。
7. `npm run dev` で起動します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 主な構成

- `src/features/*/actions.ts`: 画面から呼ぶユースケース
- `src/features/*/repository.ts`: Supabase への問い合わせ
- `src/features/problems`: TSV入力、検証、一括保存
- `src/features/review/scheduler.ts`: 復習間隔の計算
- `src/features/entitlements`: プランごとの利用制限
- `src/features/billing`: 将来の Stripe 接続境界（現在はダミー）
- `supabase/migrations`: DB、RLS、Profile自動作成、復習保存関数

## MVP の復習間隔

- `again`: 10分後（当日）
- `hard`: 1日後
- `good`: 3日後
- `easy`: 7日後
