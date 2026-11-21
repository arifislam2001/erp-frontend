export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/${path.replace(/^\//, "")}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export const TASK_STATUSES = [
  { value: "todo", label: "To do" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
  { value: "archieve", label: "Archive" },
];

export function statusLabel(status) {
  return TASK_STATUSES.find((item) => item.value === status)?.label || status || "To do";
}
