export const MS = {
  sec: 1000,
  min: 60 * 1000,
  hr: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

export function remainingMs(target) {
  const t = new Date(target);
  if (Number.isNaN(t.getTime())) return null;
  return t - new Date();
}

export function relativeFromNow(target) {
  const diff = remainingMs(target);
  if (diff == null) return null;
  if (diff <= 0) return "now";

  const day = Math.floor(diff / MS.day);
  const hr = Math.floor((diff % MS.day) / MS.hr);
  const min = Math.floor((diff % MS.hr) / MS.min);
  const sec = Math.floor((diff % MS.min) / MS.sec);

  if (day > 1) return `in ${day} days`;
  if (day === 1) return "in 1 day";
  if (hr > 1) return `in ${hr} hours`;
  if (hr === 1) return "in 1 hour";
  if (min > 1) return `in ${min} minutes`;
  if (min === 1) return "in 1 minute";
  return `in ${sec} seconds`;
}

export function formatRemainingHMS(target) {
  const diff = remainingMs(target);
  if (diff == null) return "";
  const d = Math.max(0, diff);
  const hh = Math.floor(d / MS.hr).toString().padStart(2, "0");
  const mm = Math.floor((d % MS.hr) / MS.min).toString().padStart(2, "0");
  const ss = Math.floor((d % MS.min) / MS.sec).toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function formatLocal(dt) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

/**
 * Decide which reminder to send given now and target time.
 * Enforces stage windows and minimum lead times so short-lived capsules don't spam reminders.
 * Returns a stage key or null if none due.
 */
export function nextReminderStage(target, sentSet = new Set(), createdAt = null) {
  const diff = remainingMs(target);
  if (diff == null) return null;
  if (diff <= 0) return null;

  const targetDate = new Date(target);
  const createdDate = createdAt ? new Date(createdAt) : null;
  // Total lifespan from creation to unlock
  const totalDuration =
    createdDate && !Number.isNaN(createdDate.getTime())
      ? targetDate - createdDate
      : Infinity;

  // Stages configuration:
  // - maxMs: stage triggers when diff <= maxMs
  // - minMs: stage only triggers if diff > minMs (e.g. don't send 1h reminder if only 5 minutes left)
  // - minLead: only send this reminder if the capsule was created with at least this much total duration
  const stages = [
    { key: "24h", maxMs: 24 * MS.hr, minMs: 1 * MS.hr, minLead: 48 * MS.hr },
    { key: "1h",  maxMs: 1 * MS.hr,  minMs: 10 * MS.min, minLead: 2 * MS.hr },
    { key: "10m", maxMs: 10 * MS.min, minMs: 1 * MS.min,  minLead: 20 * MS.min },
    { key: "1m",  maxMs: 1 * MS.min,  minMs: 0,           minLead: 3 * MS.min },
  ];

  for (const s of stages) {
    if (
      diff <= s.maxMs &&
      diff > s.minMs &&
      totalDuration >= s.minLead &&
      !sentSet.has(s.key)
    ) {
      return s.key;
    }
  }
  return null;
}
