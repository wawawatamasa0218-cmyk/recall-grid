# RecallGrid

問題をまとめて作り、必要なカードを復習し、無料でデッキを共有できる暗記プラットフォームです。

## 図面

全体鳥観図、画面鳥観図、機能フロー、ER図は [docs/diagrams](./docs/diagrams/README.md) にまとめています。

## デプロイ

公開は Vercel + Supabase 構成を想定しています。手順は [docs/deployment.md](./docs/deployment.md) にまとめています。

## セットアップ

1. Node.js 20.9以上を使用します。nvm環境では `nvm use` を実行します。
2. `npm install` を実行します。
3. Supabaseプロジェクトを作成します。
4. `supabase/migrations` のSQLを番号順に適用します。
5. `.env.example` を `.env.local` にコピーして接続情報を設定します。
6. Supabase AuthenticationのSite URLを `http://localhost:3000` に設定します。
7. `npm run dev` で起動します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=server-only-key
SUPABASE_DB_PASSWORD=database-password
```

## MVP機能

- メール認証、ログイン、ログアウト、パスワード再設定、任意のGoogle OAuth
- デッキ・問題の作成、編集、削除、検索、デッキ／タグ絞り込み
- TSV / CSV一括入力、Excelコピー貼り付け、入力検証、プレビュー、画像問題
- 最大5択のランダム出題、今日の復習、苦手問題だけの復習
- 正解は3日後、不正解／わからないは10分後に再出題
- 学習履歴、正答率、連続学習日数、14日グラフ
- デッキ公開／非公開、共有URL、公開一覧、カテゴリ／タグ絞り込み
- 公開デッキの新着順・人気順・コピー数ランキング
- 公開デッキへのいいね、公開名設定
- 公開デッキを独立した自分のデータとしてコピー
- Freeプランは最大3デッキ、100カード

## 実装しない機能

- Stripe課金、デッキ売買、返金、出品者管理
- AI問題生成、AI誤答生成、外部有料API
- 高度なFSRSアルゴリズム

Free／Pro、AI利用権限、将来の課金識別子のDB構造だけは残しています。StripeやOpenAI APIを呼ぶ処理はMVPに含めません。

## セキュリティ

- 非公開デッキとカードは所有者だけが読み書きできます。
- `is_public = true` のデッキと所属カードだけ、匿名ユーザーが読み取れます。
- 他人の公開デッキは直接編集できません。
- コピー時は新しいデッキ・カード・画像を作り、コピー先ユーザーが所有します。
- `.env.local` はGit管理対象外です。

## 品質確認

`npm test` でTSV、入力検証、ランダム選択肢、復習間隔の単体テストを実行できます。
