import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ticketService } from "../services/api";
import StatsCard from "../components/StatsCard";
import TicketTable from "../components/TicketTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { CATEGORY_ICONS } from "../constants";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await ticketService.getStats();
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const total = stats?.total_tickets ?? 0;
  const byPriority = stats?.by_priority ?? {};
  const byCategory = stats?.by_category ?? {};

  const resolutionRate = total > 0
    ? Math.round(((stats.resolved_tickets + stats.closed_tickets) / total) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your helpdesk activity</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          + New Ticket
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Tickets" value={stats?.total_tickets} icon="🎫" color="indigo" description="All time" />
        <StatsCard label="Open" value={stats?.open_tickets} icon="📂" color="yellow" description="Awaiting action" />
        <StatsCard label="In Progress" value={stats?.in_progress_tickets} icon="⚙️" color="purple" description="Being worked on" />
        <StatsCard label="Resolved / Closed" value={(stats?.resolved_tickets ?? 0) + (stats?.closed_tickets ?? 0)} icon="✅" color="green" description={`${resolutionRate}% resolution rate`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Tickets */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Recent Tickets</h2>
            <Link to="/tickets" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all →
            </Link>
          </div>
          {stats?.recent_tickets?.length > 0 ? (
            <TicketTable tickets={stats.recent_tickets} showActions={false} />
          ) : (
            <div className="card flex flex-col items-center justify-center py-10 text-center gap-2">
              <span className="text-3xl">🎫</span>
              <p className="text-sm text-gray-500">No tickets yet. Create your first ticket!</p>
              <Link to="/tickets/new" className="btn-primary mt-2">Create Ticket</Link>
            </div>
          )}
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* By Priority */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Priority</h3>
            <div className="space-y-2">
              {[
                { key: "Critical", color: "bg-red-500" },
                { key: "High", color: "bg-orange-400" },
                { key: "Medium", color: "bg-yellow-400" },
                { key: "Low", color: "bg-blue-400" },
              ].map(({ key, color }) => {
                const count = byPriority[key] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{key}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By Category */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Category</h3>
            <div className="space-y-2">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 truncate">
                      <span>{CATEGORY_ICONS[cat] || "🎫"}</span>
                      <span className="truncate">{cat}</span>
                    </span>
                    <span className="font-semibold text-gray-800 flex-shrink-0 ml-2">{count}</span>
                  </div>
                ))}
              {Object.keys(byCategory).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
