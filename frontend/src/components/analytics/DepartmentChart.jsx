import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const BARS = [
  { key: "open", color: "#9ca3af", label: "Open" },
  { key: "in_progress", color: "#a855f7", label: "In Progress" },
  { key: "resolved", color: "#22c55e", label: "Resolved" },
  { key: "closed", color: "#64748b", label: "Closed" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
      <p className="text-gray-700 font-semibold border-t mt-1 pt-1">Total: {total}</p>
    </div>
  );
};

export default function DepartmentChart({ data }) {
  if (!data?.length) {
    return <EmptyChart title="Tickets by Department" />;
  }

  return (
    <ChartCard title="Tickets by Department (Stacked)">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="department"
            tick={{ fontSize: 11, angle: -25, textAnchor: "end" }}
            interval={0}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {BARS.map(({ key, color, label }) => (
            <Bar key={key} dataKey={key} name={label} stackId="a" fill={color} />
          ))}
        </BarChart>
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
