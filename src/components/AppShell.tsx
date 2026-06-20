"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/features/auth/actions";

const nav = [{ href: "/dashboard", label: "ホーム", icon: "⌂" }, { href: "/decks", label: "デッキ", icon: "▱" }, { href: "/problems", label: "問題", icon: "✎" }, { href: "/review", label: "復習", icon: "↻" }];

export function AppShell({ children, email }: { children: ReactNode; email?: string }) {
  const pathname = usePathname();
  return <div className="app-layout"><aside className="sidebar"><Link href="/dashboard" className="brand"><span>R</span><strong>RecallGrid</strong></Link><nav aria-label="メインナビゲーション">{nav.map((item) => { const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link href={item.href} key={item.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>; })}</nav><div className="sidebar-bottom"><div className="mini-profile"><span>{email?.slice(0, 1).toUpperCase() ?? "U"}</span><div><strong>Free plan</strong><small>{email}</small></div></div><form action={signOut}><button>ログアウト</button></form></div></aside><main className="main-content">{children}</main></div>;
}
