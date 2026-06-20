import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { listDueCards } from "@/features/review/repository";
import { ReviewSession } from "@/features/review/ReviewSession";

export default async function ReviewPage() {
  const user = await requireUser();
  const cards = await listDueCards(user.id);
  return <AppShell email={user.email}><div className="page-wrap review-page"><header className="page-header compact"><div><span className="eyebrow">TODAY&apos;S REVIEW</span><h1>今日の復習</h1><p>{cards.length}問があなたを待っています。</p></div></header><ReviewSession initialCards={cards} /></div></AppShell>;
}
