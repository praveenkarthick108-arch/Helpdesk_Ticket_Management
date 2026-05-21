import { useState } from "react";

const STATUS_STYLES = {
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  running: "bg-yellow-100 text-yellow-800",
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function EtlPanel({ etlStatus, onRunEtl, isRunning }) {
  const job = etlStatus?.latest_job;
  const total = etlStatus?.total_analytics_records ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>⚙️</span> ETL Pipeline
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Extract, Transform & Load historical ticket data from CSV
          </p>
        </div>
        <button
          onClick={onRunEtl}
          disabled={isRunning}
          className="btn-primary shrink-0 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Processing…
            </>
          ) : (
            <>
              <span>▶</span> Run ETL Pipeline
            </>
          )}
        </button>
      </div>

      {job ? (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 pt-5">
          <Stat label="Status">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[job.status] || "bg-gray-100 text-gray-700"}`}
            >
              {job.status}
            </span>
          </Stat>
          <Stat label="Rows Extracted">{job.rows_extracted ?? "—"}</Stat>
          <Stat label="Rows Loaded">{job.rows_loaded ?? "—"}</Stat>
          <Stat label="Rows Skipped">{job.rows_skipped ?? "—"}</Stat>
          <Stat label="CSV File">{job.csv_filename ?? "—"}</Stat>
          <Stat label="Started">{fmt(job.started_at)}</Stat>
          <Stat label="Finished">{fmt(job.finished_at)}</Stat>
          <Stat label="Total Records in DB">{total.toLocaleString()}</Stat>
          {job.error_message && (
            <div className="col-span-2 sm:col-span-4 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 font-mono break-all">
              {job.error_message}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400 italic">
          No ETL run yet. Click "Run ETL Pipeline" to load analytics data.
        </p>
      )}
    </div>
  );
}

function Stat({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-800">{children}</p>
    </div>
  );
}
