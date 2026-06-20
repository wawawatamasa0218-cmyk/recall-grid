"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return <main className="system-page"><div className="system-card"><span className="system-code">ERROR</span><h1>うまく読み込めませんでした</h1><p>接続が一時的に不安定な可能性があります。少し待ってから、もう一度お試しください。</p><div className="system-actions"><button className="button primary" onClick={reset}>もう一度試す</button><Link className="button secondary" href="/">トップへ戻る</Link></div></div></main>;
}
