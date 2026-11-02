const DAY = 86_400_000;
const IST_OFFSET = 330 * 60_000;

/** Calendar days in India, without inventing an opening time for the summit. */
export function summitCountdown(now: number, startDate: string, endDate: string) {
  const today = Math.floor((now + IST_OFFSET) / DAY);
  const start = Math.floor(Date.parse(`${startDate}T00:00:00Z`) / DAY);
  const end = Math.floor(Date.parse(`${endDate}T00:00:00Z`) / DAY);
  if (today < start) return { phase: "upcoming" as const, days: start - today };
  if (today <= end) return { phase: "live" as const, days: 0 };
  return { phase: "finished" as const, days: 0 };
}

export function untilNextIndiaDay(now: number) {
  return DAY - ((now + IST_OFFSET) % DAY) + 50;
}
