export const SECTORS = [
  ["beauty", "Beauty & skincare"],
  ["wellness", "Health & wellness"],
  ["dental", "Dental & oral care"],
  ["fashion", "Fashion & accessories"],
  ["home", "Home & lifestyle"],
];
export const REGIONS = [
  ["uk", "United Kingdom"],
  ["us", "United States"],
  ["ca", "Canada"],
];
export const STAGES = [
  ["new", "New"],
  ["review", "In review"],
  ["approved", "Approved"],
  ["contacted", "Contacted manually"],
  ["replied", "Replied"],
  ["meeting", "Meeting booked"],
  ["won", "Won"],
  ["not_fit", "Not a fit"],
];
export const labelFor = (items, key) =>
  items.find((x) => x[0] === key)?.[1] || key;
export function dateLabel(value) {
  if (!value) return "Not run yet";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "Unknown time"
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
}
export function mergeLeads(previous, incoming) {
  const byDomain = new Map(previous.map((x) => [x.domain, x]));
  for (const lead of incoming) {
    const old = byDomain.get(lead.domain);
    byDomain.set(
      lead.domain,
      old
        ? {
            ...old,
            ...lead,
            id: old.id,
            stage: old.stage,
            notes: old.notes,
            outreach_body: old.outreach_body,
            outreach_subject: old.outreach_subject,
          }
        : lead,
    );
  }
  return [...byDomain.values()].sort((a, b) => (b.score || 0) - (a.score || 0));
}
export function safeLink(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function csvContent(leads) {
  const fields = [
    "name",
    "domain",
    "sector",
    "region",
    "score",
    "shopify",
    "qualification",
    "stage",
    "website",
    "reason",
    "scanned_at",
  ];
  const cell = (value) => {
    let s = String(value ?? "");
    if (/^[\s]*[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return [
    fields.join(","),
    ...leads.map((lead) => fields.map((k) => cell(lead[k])).join(",")),
  ].join("\r\n");
}
export function exportLeads(leads) {
  const url = URL.createObjectURL(
    new Blob([csvContent(leads)], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "prospect-shortlist.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
