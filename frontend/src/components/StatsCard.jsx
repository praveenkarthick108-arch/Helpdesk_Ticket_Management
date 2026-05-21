export default function StatsCard({ label, value, icon, color = "indigo", description }) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", ring: "ring-yellow-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-100" },
    green: { bg: "bg-green-50", text: "text-green-600", ring: "ring-green-100" },
    red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
    gray: { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-100" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="card flex items-center gap-4">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value ?? "—"}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
