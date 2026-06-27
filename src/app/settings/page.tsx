import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getDisplayName } from "@/features/profile/repository";
import { ProfileForm } from "@/features/profile/ProfileForm";

export default async function SettingsPage() {
  const user = await requireUser();
  const displayName = await getDisplayName(user.id);
  return <AppShell email={user.email}><div className="page-wrap narrow"><header className="page-header"><div><span className="eyebrow">SETTINGS</span><h1>設定</h1><p>アカウント情報を確認します。</p></div></header><section className="settings-grid"><article className="settings-card"><span className="eyebrow">ACCOUNT</span><h2>{user.email}</h2><p>公開名は公開デッキの作成者として表示されます。メールアドレスは公開されません。</p><ProfileForm initialName={displayName} /></article><article className="settings-card"><span className="eyebrow">SECURITY</span><h2>パスワード</h2><p>ログイン画面の「パスワードを忘れた場合」から安全に変更できます。</p></article><article className="settings-card"><span className="eyebrow">FUTURE</span><h2>将来の拡張</h2><p>課金やAI生成を追加できる内部構造は残していますが、現在の画面には表示していません。</p></article></section></div></AppShell>;
}
