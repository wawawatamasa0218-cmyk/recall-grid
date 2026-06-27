# 02. 画面鳥観図

現在の主要画面と URL の鳥観図です。

```mermaid
flowchart TB
  Top["/\nトップ / ログイン導線"]

  subgraph Auth["認証"]
    Callback["/auth/callback\nSupabase OAuth / Email callback"]
    Forgot["/auth/forgot-password\nパスワード再設定メール"]
    Update["/auth/update-password\n新パスワード設定"]
  end

  subgraph Private["ログイン後画面"]
    Dashboard["/dashboard\nダッシュボード"]
    Decks["/decks\nデッキ一覧・作成・編集・削除・公開設定"]
    DeckDetail["/decks/[id]\nデッキ詳細・カード一覧"]
    Problems["/problems\n問題作成・CSV/TSV貼り付け・検索・編集・削除"]
    Review["/review\n今日の復習 / 苦手問題モード"]
    Analytics["/analytics\n学習履歴・分析"]
    Settings["/settings\n表示名・プロフィール設定"]
  end

  subgraph Public["公開画面"]
    Explore["/explore\n公開デッキ一覧・検索・ランキング"]
    Share["/share/[slug]\n公開デッキ詳細・コピー・いいね"]
  end

  Top --> Dashboard
  Top --> Forgot
  Top --> Explore
  Forgot --> Update
  Callback --> Dashboard

  Dashboard --> Decks
  Dashboard --> Problems
  Dashboard --> Review
  Dashboard --> Explore
  Dashboard --> Analytics
  Dashboard --> Settings

  Decks --> DeckDetail
  Decks --> Problems
  Decks --> Share
  DeckDetail --> Problems
  Problems --> DeckDetail
  Review --> Analytics
  Explore --> Share
  Share -->|"コピー後"| Decks
```

## 画面別の役割

| 画面 | 主な役割 | 認証 |
| --- | --- | --- |
| `/` | トップ、ログイン・登録フォームへの入口 | 任意 |
| `/dashboard` | 復習数、デッキ数、カード数、最近のデッキ | 必須 |
| `/decks` | デッキ作成、一覧、編集、削除、公開設定 | 必須 |
| `/decks/[id]` | デッキ詳細、登録カード確認 | 必須 |
| `/problems` | 複数問題入力、CSV/TSV貼り付け、CSV読み込み、検索、編集、削除 | 必須 |
| `/review` | ランダム出題、選択肢回答、復習ログ保存 | 必須 |
| `/analytics` | 復習履歴、正答率、直近推移 | 必須 |
| `/settings` | 公開表示名などプロフィール設定 | 必須 |
| `/explore` | 公開デッキ一覧、ランキング、タグ絞り込み | 任意 |
| `/share/[slug]` | 公開デッキ詳細、コピー、いいね | 任意 / コピーは必須 |
| `/auth/forgot-password` | パスワード再設定メール送信 | 任意 |
| `/auth/update-password` | 新しいパスワード設定 | 任意 |

## 代表的なユーザー導線

```mermaid
journey
  title RecallGrid の基本利用導線
  section 登録
    トップにアクセス: 3: User
    メール・パスワードで登録: 4: User
    ダッシュボードへ移動: 4: User
  section 作成
    デッキを作成: 5: User
    問題作成画面へ移動: 5: User
    CSV/TSV貼り付けで複数カード作成: 5: User
  section 復習
    今日の復習を開始: 5: User
    5択またはわからないで回答: 4: User
    次回復習日が更新される: 5: System
  section 共有
    デッキを公開: 4: User
    共有URLを送る: 4: User
    他ユーザーがコピー: 5: OtherUser
```
