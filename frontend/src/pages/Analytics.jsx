import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import StatsCard from "../components/StatsCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EtlPanel from "../components/analytics/EtlPanel";
import CategoryBarChart from "../components/analytics/CategoryBarChart";
import PriorityPieChart from "../components/analytics/PriorityPieChart";
import MonthlyTrendChart from "../components/analytics/MonthlyTrendChart";
import ResolutionTimeChart from "../components/analytics/ResolutionTimeChart";
import DepartmentChart from "../components/analytics/DepartmentChart";
import { analyticsService } from "../services/api";

const INITIAL_DATA = {
  categoryDist: null,
  priorityDist: null,
  departmentBreakdown: null,
  monthlyTrends: null,
  resolutionTime: null,
  etlStatus: null,
};

export default function Analytics() {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [etlRunning, setEtlRunning] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [cat, pri, dept, monthly, res, etl] = await Promise.all([
        analyticsService.getCategoryDistribution(),
        analyticsService.getPriorityDistribution(),
        analyticsService.getDepartmentBreakdown(),
        analyticsService.getMonthlyTrends(),
        analyticsService.getResolutionTime(),
        analyticsService.getEtlStatus(),
      ]);
      setData({
        categoryDist: cat.data.data,
        priorityDist: pri.data.data,
        departmentBreakdown: dept.data.data,
        monthlyTrends: monthly.data.data,
        resolutionTime: res.data,
        etlStatus: etl.data,
      });
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRunEtl = async () => {
    setEtlRunning(true);
    try {
      const res = await analyticsService.runEtl("historical_tickets.csv");
      const result = res.data;
      toast.success(
        `ETL complete — ${result.rows_loaded} rows loaded, ${result.rows_skipped} skipped`
      );
      await fetchAll();
    } catch (err) {
      toast.error(`ETL failed: ${err.message}`);
      await fetchAll();
    } finally {
      setEtlRunning(false);
    }
  };

  // KPI derivations
  const totalRecords = data.etlStatus?.total_analytics_records ?? 0;
  const overallAvg = data.resolutionTime?.overall_avg_hours;
  const topCategory = data.categoryDist?.[0]?.category ?? "—";

  const resolutionRate = (() => {
    if (!data.categoryDist) return "—";
    const total = data.etlStatus?.total_analytics_records || 0;
    if (!total) return "—";
    const resolved = (data.priorityDist ?? []).reduce((acc, _) => acc, 0);
    // compute from monthly trends total vs resolved+closed
    const [res, clo] = (data.monthlyTrends ?? []).reduce(
      ([r, c], m) => [r + m.resolved, c + m.closed],
      [0, 0]
    );
    return total ? `${Math.round(((res + clo) / total) * 100)}%` : "—";
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading analytics…" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Historical ticket insights powered by the ETL pipeline
        </p>
      </div>

      {/* ETL Control Panel */}
      <EtlPanel
        etlStatus={data.etlStatus}
        onRunEtl={handleRunEtl}
        isRunning={etlRunning}
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Records Loaded"
          value={totalRecords.toLocaleString()}
          icon="📊"
          color="indigo"
          description="From historical CSV dataset"
        />
        <StatsCard
          label="Avg Resolution Time"
          value={overallAvg != null ? `${overallAvg} hrs` : "—"}
          icon="⏱️"
          color="purple"
          description="Across all resolved tickets"
        />
        <StatsCard
          label="Top Issue Category"
          value={topCategory}
          icon="🏷️"
          color="yellow"
          description="Most common issue type"
        />
        <StatsCard
          label="Resolution Rate"
          value={resolutionRate}
          icon="✅"
          color="green"
          description="Resolved + Closed tickets"
        />
      </div>

      {/* Row 1: Category + Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryBarChart data={data.categoryDist} />
        </div>
        <div className="lg:col-span-1">
          <PriorityPieChart data={data.priorityDist} />
        </div>
      </div>

      {/* Row 2: Monthly Trends (full width) */}
      <MonthlyTrendChart data={data.monthlyTrends} />

      {/* Row 3: Resolution Time + Department Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResolutionTimeChart
            data={data.resolutionTime?.data}
            overallAvg={data.resolutionTime?.overall_avg_hours}
          />
        </div>
        <div className="lg:col-span-1">
          <DepartmentSummaryTable data={data.departmentBreakdown} />
        </div>
      </div>

      {/* Row 4: Department stacked bar (full width) */}
      <DepartmentChart data={data.departmentBreakdown} />
    </div>
  );
}

function DepartmentSummaryTable({ data }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Department Summary</h3>
      {!data?.length ? (
        <p className="text-gray-400 text-sm">No data — run ETL first</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-2 font-medium">Department</th>
                <th className="pb-2 px-2 font-medium text-right">Total</th>
                <th className="pb-2 px-2 font-medium text-right">Open</th>
                <th className="pb-2 pl-2 font-medium text-right">Done</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.department} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-1.5 pr-2 text-gray-700 font-medium truncate max-w-[100px]">
                    {row.department}
                  </td>
                  <td className="py-1.5 px-2 text-right font-semibold text-gray-900">
                    {row.total}
                  </td>
                  <td className="py-1.5 px-2 text-right text-gray-500">{row.open}</td>
                  <td className="py-1.5 pl-2 text-right text-green-600">
                    {row.resolved + row.closed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
