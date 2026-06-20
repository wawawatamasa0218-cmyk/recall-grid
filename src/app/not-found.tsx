import Link from "next/link";

export default function NotFound() {
  return <main className="system-page"><div className="system-card"><span className="system-code">404</span><h1>ページが見つかりません</h1><p>URLが変わったか、ページが削除された可能性があります。</p><Link className="button primary" href="/">トップへ戻る</Link></div></main>;
}
