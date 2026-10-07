export function money(value, currency = "USD") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function gb(value) {
  if (typeof value !== "number") return "";
  return `${Number.isInteger(value) ? value : value.toFixed(1)} GB`;
}

export function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function days(value) {
  return `${value} day${value === 1 ? "" : "s"}`;
}

export function fullDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function isoDay(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
