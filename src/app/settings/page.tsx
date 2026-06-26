import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getEntitlements } from "@/features/entitlements/service";
import { getDisplayName } from "@/features/profile/repository";
import { ProfileForm } from "@/features/profile/ProfileForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const [entitlements, displayName] = await Promise.all([getEntitlements(user.id), getDisplayName(user.id)]);
  return <AppShell email={user.email}><div className="page-wrap narrow"><header className="page-header"><div><span className="eyebrow">SETTINGS</span><h1>設定</h1><p>アカウントとプランを確認します。</p></div></header><section className="settings-grid"><article className="settings-card"><span className="eyebrow">ACCOUNT</span><h2>{user.email}</h2><p>公開名は公開デッキの作成者として表示されます。メールアドレスは公開されません。</p><ProfileForm initialName={displayName} /></article><article className="settings-card plan-card"><span className="eyebrow">CURRENT PLAN</span><h2>{entitlements.plan.toUpperCase()}</h2><p>現在は全ユーザーFreeプランです。デッキ{entitlements.maxDecks}件、カード{entitlements.maxCards}問まで利用できます。</p></article><article className="settings-card"><span className="eyebrow">SECURITY</span><h2>パスワード</h2><p>ログイン画面の「パスワードを忘れた場合」から安全に変更できます。</p></article><article className="settings-card"><span className="eyebrow">FUTURE</span><h2>Pro / AI</h2><p>将来追加できるDB構造だけを保持しています。Stripe課金・AI API処理はMVPには含めていません。</p></article></section></div></AppShell>;
}
