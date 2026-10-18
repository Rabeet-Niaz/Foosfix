// "2 hours ago", "3 days ago", "just now"
export function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
  
    const units = [
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60],
    ];
    for (const [name, size] of units) {
      const n = Math.floor(seconds / size);
      if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
    }
  }
  
  // "17 Oct 2026, 11:42 PM"
  export function formatDateTime(date) {
    return new Date(date)
      .toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\b(am|pm)\b/, (m) => m.toUpperCase());
  }