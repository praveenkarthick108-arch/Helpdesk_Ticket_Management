export const ISSUE_CATEGORIES = [
  "VPN Issue",
  "Password Reset",
  "Software Installation",
  "Laptop Issue",
  "Email Access",
  "Network Connectivity",
  "Hardware Request",
];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"];
export const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
  "Operations",
  "IT",
  "Legal",
  "Customer Support",
  "Product",
];

export const PRIORITY_COLORS = {
  Low: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-400", border: "border-blue-200" },
  Medium: { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-400", border: "border-yellow-200" },
  High: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-400", border: "border-orange-200" },
  Critical: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500", border: "border-red-200" },
};

export const STATUS_COLORS = {
  Open: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  "In Progress": { bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
  Resolved: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  Closed: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

export const CATEGORY_ICONS = {
  "VPN Issue": "🔐",
  "Password Reset": "🔑",
  "Software Installation": "💿",
  "Laptop Issue": "💻",
  "Email Access": "📧",
  "Network Connectivity": "🌐",
  "Hardware Request": "🖥️",
};
