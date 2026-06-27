import Link from "next/link";

const screens = [
  { path: "/", title: "トップ", note: "ログイン・登録・公開デッキへの入口" },
  { path: "/dashboard", title: "ダッシュボード", note: "今日の復習数、デッキ数、カード数、主要導線" },
  { path: "/decks", title: "デッキ", note: "作成・一覧・編集・削除・公開設定" },
  { path: "/decks/[id]", title: "デッキ詳細", note: "カード一覧とデッキ単位の確認" },
  { path: "/problems", title: "問題作成", note: "CSV/TSV貼り付け、CSV読み込み、複数入力、検索、編集、削除" },
  { path: "/review", title: "復習", note: "ランダム出題、最大5択、わからない、苦手問題モード" },
  { path: "/explore", title: "公開デッキ", note: "公開デッキ一覧、検索、ランキング、タグ絞り込み" },
  { path: "/share/[slug]", title: "共有ページ", note: "公開デッキ閲覧、コピー、いいね" },
  { path: "/analytics", title: "分析", note: "復習ログ、正答率、連続学習、14日推移" },
  { path: "/settings", title: "設定", note: "公開表示名などプロフィール設定" },
];

const tables = [
  ["profiles", "ユーザーのプラン、AI権限、公開表示名、将来課金用カラム"],
  ["decks", "デッキ本体。公開状態、共有URL、コピー数、いいね数を保持"],
  ["cards", "問題カード本体。タグ、画像、次回復習日時を保持"],
  ["reviews", "復習ログ。回答結果と次回復習日を記録"],
  ["deck_copies", "公開デッキコピーの履歴"],
  ["deck_likes", "公開デッキへのいいね"],
];

export default function DocsPage() {
  return (
    <main className="docs-page">
      <nav className="docs-nav">
        <Link href="/dashboard">← アプリへ戻る</Link>
        <Link href="/explore">公開デッキを見る</Link>
      </nav>

      <section className="docs-hero">
        <span className="eyebrow">RECALLGRID MAPS</span>
        <h1>RecallGrid 鳥観図</h1>
        <p>
          現在の MVP を、プロダクト全体・画面・データフロー・ER の4方向から見渡せるように整理したページです。
          詳細な Mermaid 版は <code>docs/diagrams</code> にあります。
        </p>
      </section>

      <section className="docs-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRODUCT</span>
            <h2>プロダクト鳥観図</h2>
          </div>
        </div>
        <div className="docs-overview-grid">
          <article>
            <strong>アカウント</strong>
            <p>登録、ログイン、ログアウト、パスワード再設定、Googleログイン枠。</p>
          </article>
          <article>
            <strong>作成</strong>
            <p>デッキ、カード、CSV/TSV一括入力、Excelコピー貼り付け、画像、検索、編集、削除。</p>
          </article>
          <article>
            <strong>復習</strong>
            <p>今日の復習、5択ランダム出題、わからない、苦手問題モード。</p>
          </article>
          <article>
            <strong>共有</strong>
            <p>公開URL、公開デッキ一覧、コピー、ランキング、いいね。</p>
          </article>
          <article>
            <strong>分析</strong>
            <p>復習数、正答率、連続学習、直近14日グラフ。</p>
          </article>
          <article>
            <strong>将来枠</strong>
            <p>Stripe、AI生成、FSRS、売買は境界だけ残して未実装。</p>
          </article>
        </div>
      </section>

      <section className="docs-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SCREEN</span>
            <h2>画面鳥観図</h2>
          </div>
        </div>
        <div className="screen-map">
          {screens.map((screen) => (
            <article key={screen.path}>
              <code>{screen.path}</code>
              <h3>{screen.title}</h3>
              <p>{screen.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FLOW</span>
            <h2>機能・データフロー鳥観図</h2>
          </div>
        </div>
        <div className="flow-lane">
          <span>page.tsx</span>
          <i>→</i>
          <span>features/*/actions.ts</span>
          <i>→</i>
          <span>features/*/repository.ts</span>
          <i>→</i>
          <span>lib/supabase</span>
          <i>→</i>
          <span>Supabase</span>
        </div>
        <div className="docs-overview-grid compact">
          <article><strong>デッキ</strong><p>作成前に Free 最大3デッキ制限を entitlements 経由で確認。</p></article>
          <article><strong>問題</strong><p>parser / validator でCSV/TSV変換と検証を分離し、保存時に最大100問制限を確認。</p></article>
          <article><strong>復習</strong><p>scheduler.ts が次回復習日を計算し、record_review RPC でログとカードを更新。</p></article>
          <article><strong>共有</strong><p>公開デッキのみ匿名 read 可能。コピー後は別ユーザー所有の deck/card として保存。</p></article>
        </div>
      </section>

      <section className="docs-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ERD</span>
            <h2>ER図サマリ</h2>
          </div>
        </div>
        <div className="er-summary">
          <div className="er-node primary">auth.users</div>
          <div className="er-node">profiles</div>
          <div className="er-node">decks</div>
          <div className="er-node">cards</div>
          <div className="er-node">reviews</div>
          <div className="er-node">deck_copies</div>
          <div className="er-node">deck_likes</div>
        </div>
        <div className="table-card">
          <table>
            <thead><tr><th>テーブル</th><th>役割</th></tr></thead>
            <tbody>
              {tables.map(([name, note]) => <tr key={name}><td><code>{name}</code></td><td>{note}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
