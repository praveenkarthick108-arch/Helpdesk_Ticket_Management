import { Link } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "./Badge";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TicketTable({ tickets, onDelete, showActions = true }) {
  if (!tickets || tickets.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Date</th>
            {showActions && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-400">#{ticket.ticket_id}</td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-[160px]">{ticket.employee_name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px]">{ticket.department}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                <span className="truncate max-w-[140px] block">{ticket.issue_category}</span>
              </td>
              <td className="px-4 py-3"><PriorityBadge value={ticket.priority} /></td>
              <td className="px-4 py-3"><StatusBadge value={ticket.status} /></td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">{formatDate(ticket.created_at)}</td>
              {showActions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/tickets/${ticket.ticket_id}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">
                      View
                    </Link>
                    {onDelete && (
                      <button onClick={() => onDelete(ticket.ticket_id)} className="text-red-400 hover:text-red-600 font-medium text-xs">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
