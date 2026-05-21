import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from "recharts";

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#3b82f6",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{d.priority}</p>
      <p style={{ color: PRIORITY_COLORS[d.priority] || "#6366f1" }}>
        {d.count} tickets ({d.percentage}%)
      </p>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  if (percentage < 8) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
      {`${percentage}%`}
    </text>
  );
};

export default function PriorityPieChart({ data }) {
  if (!data?.length) {
    return <EmptyChart title="Priority Distribution" />;
  }

  return (
    <ChartCard title="Priority Distribution">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            dataKey="count"
            nameKey="priority"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={PRIORITY_COLORS[entry.priority] || "#6366f1"}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-700">{value}</span>
            )}
          />
        </PieChart>
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
