export function startOfTodayIso(now = new Date()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function endOfTodayIso(now = new Date()) {
  const date = new Date(now);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
