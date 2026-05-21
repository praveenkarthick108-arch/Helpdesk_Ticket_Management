import { useState, useEffect } from "react";
import { ISSUE_CATEGORIES, PRIORITIES, STATUSES } from "../constants";

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest First" },
  { value: "created_at:asc", label: "Oldest First" },
  { value: "priority:desc", label: "Priority (High → Low)" },
  { value: "priority:asc", label: "Priority (Low → High)" },
  { value: "employee_name:asc", label: "Employee Name (A-Z)" },
  { value: "ticket_id:desc", label: "Ticket ID (Newest)" },
];

export default function FilterBar({ filters, onFilterChange }) {
  const [keyword, setKeyword] = useState(filters.keyword || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== filters.keyword) {
        onFilterChange({ ...filters, keyword });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setKeyword(filters.keyword || "");
  }, [filters.keyword]);

  const handleSelect = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSortChange = (e) => {
    const [sort_by, sort_order] = e.target.value.split(":");
    onFilterChange({ ...filters, sort_by, sort_order });
  };

  const hasActiveFilters = filters.keyword || filters.category || filters.status || filters.priority;

  const clearAll = () => {
    setKeyword("");
    onFilterChange({ keyword: "", category: "", status: "", priority: "", sort_by: "created_at", sort_order: "desc" });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by employee, description, category..."
            className="input-field pl-9"
          />
        </div>
        {hasActiveFilters && (
          <button onClick={clearAll} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 whitespace-nowrap">
            ✕ Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select name="category" value={filters.category} onChange={handleSelect} className="input-field">
          <option value="">All Categories</option>
          {ISSUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select name="status" value={filters.status} onChange={handleSelect} className="input-field">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select name="priority" value={filters.priority} onChange={handleSelect} className="input-field">
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={`${filters.sort_by}:${filters.sort_order}`}
          onChange={handleSortChange}
          className="input-field"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
