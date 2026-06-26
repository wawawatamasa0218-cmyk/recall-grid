import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { listAnswerPool, listDueCards, listWeakCards } from "@/features/review/repository";
import { ReviewSession } from "@/features/review/ReviewSession";
import { buildReviewQuestions } from "@/features/review/randomizer";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const user = await requireUser();
  const { mode } = await searchParams;
  const [cards, answerPool] = await Promise.all([
    mode === "weak" ? listWeakCards(user.id) : listDueCards(user.id),
    listAnswerPool(user.id),
  ]);
  const questions = buildReviewQuestions(cards, answerPool);
  return <AppShell email={user.email}><div className="page-wrap review-page"><header className="page-header compact"><div><span className="eyebrow">{mode === "weak" ? "WEAK POINTS" : "TODAY'S REVIEW"}</span><h1>{mode === "weak" ? "苦手問題の復習" : "今日の復習"}</h1><p>{questions.length}問があなたを待っています。</p></div><div className="review-mode-tabs"><a href="/review" className={mode !== "weak" ? "active" : ""}>今日</a><a href="/review?mode=weak" className={mode === "weak" ? "active" : ""}>苦手だけ</a></div></header><ReviewSession initialCards={questions} /></div></AppShell>;
}
