import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getLearningAnalytics } from "@/features/review/analytics";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const data = await getLearningAnalytics(user.id);
  const max = Math.max(1, ...data.last14Days.map((day) => day.count));
  return <AppShell email={user.email}><div className="page-wrap"><header className="page-header"><div><span className="eyebrow">LEARNING ANALYTICS</span><h1>学習分析</h1><p>直近90日の学習状況です。</p></div></header><section className="stats-grid analytics-stats"><article className="stat-card accent"><span>総復習回数</span><strong>{data.totalReviews}<small>回</small></strong></article><article className="stat-card"><span>正答率</span><strong>{data.accuracy}<small>%</small></strong></article><article className="stat-card"><span>連続学習</span><strong>{data.streak}<small>日</small></strong></article></section><section className="dashboard-section analytics-card"><div className="section-heading"><div><span className="eyebrow">LAST 14 DAYS</span><h2>復習量</h2></div><span>登録カード {data.totalCards}問</span></div><div className="review-chart">{data.last14Days.map((day) => <div key={day.date}><span>{day.count}</span><i style={{ height: `${Math.max(4, (day.count / max) * 100)}%` }} /><small>{day.date.slice(5)}</small></div>)}</div></section></div></AppShell>;
}
