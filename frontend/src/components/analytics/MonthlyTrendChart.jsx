import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const LINES = [
  { key: "total", color: "#6366f1", label: "Total" },
  { key: "open", color: "#9ca3af", label: "Open" },
  { key: "in_progress", color: "#a855f7", label: "In Progress" },
  { key: "resolved", color: "#22c55e", label: "Resolved" },
  { key: "closed", color: "#64748b", label: "Closed" },
];

function formatMonth(m) {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm min-w-[150px]">
      <p className="font-semibold text-gray-800 mb-1">{formatMonth(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function MonthlyTrendChart({ data }) {
  if (!data?.length) {
    return <EmptyChart title="Monthly Ticket Volume" />;
  }

  return (
    <ChartCard title="Monthly Ticket Volume">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {LINES.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart({ title }) {
  return (
    <ChartCard title={title}>
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data — run the ETL pipeline first
      </div>
    </ChartCard>
  );
}
