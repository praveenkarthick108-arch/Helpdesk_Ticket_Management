import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

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
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{formatMonth(label)}</p>
      <p className="text-indigo-600">Avg: {d.avg_hours} hrs</p>
      <p className="text-gray-500">Min: {d.min_hours} hrs</p>
      <p className="text-gray-500">Max: {d.max_hours} hrs</p>
      <p className="text-gray-500">{d.ticket_count} tickets resolved</p>
    </div>
  );
};

export default function ResolutionTimeChart({ data, overallAvg }) {
  if (!data?.length) {
    return <EmptyChart title="Avg Resolution Time (hours)" />;
  }

  return (
    <ChartCard title="Avg Resolution Time (hours)">
      {overallAvg != null && (
        <p className="text-xs text-gray-500 mb-2">
          Overall average:{" "}
          <span className="font-semibold text-orange-500">{overallAvg} hrs</span>
        </p>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} unit=" h" />
          <Tooltip content={<CustomTooltip />} />
          {overallAvg != null && (
            <ReferenceLine
              y={overallAvg}
              stroke="#f97316"
              strokeDasharray="5 3"
              label={{ value: "Avg", position: "insideTopRight", fill: "#f97316", fontSize: 11 }}
            />
          )}
          <Bar dataKey="avg_hours" name="Avg hrs" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
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
