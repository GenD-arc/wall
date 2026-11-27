const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function clock(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m}${h < 12 ? "am" : "pm"}`;
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// 2008-style timestamps: "about a minute ago", "Yesterday at 3:42pm",
// "November 3 at 9:15am", "November 3rd, 2025 at 9:15am".
export function wallTime(iso: string, now: number = Date.now()) {
  const d = new Date(iso);
  const diff = Math.max(0, (now - d.getTime()) / 1000);

  if (diff < 45) return "a few seconds ago";
  if (diff < 90) return "about a minute ago";
  if (diff < 3600) return `${Math.round(diff / 60)} minutes ago`;
  if (diff < 5400) return "about an hour ago";
  if (diff < 86400) return `${Math.round(diff / 3600)} hours ago`;

  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${clock(d)}`;

  if (d.getFullYear() === today.getFullYear()) {
    return `${MONTHS[d.getMonth()]} ${d.getDate()} at ${clock(d)}`;
  }
  return `${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}, ${d.getFullYear()} at ${clock(d)}`;
}

export function fullTime(iso: string) {
  return new Date(iso).toLocaleString();
}
