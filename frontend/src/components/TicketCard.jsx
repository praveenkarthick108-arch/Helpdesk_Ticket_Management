import { Link } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "./Badge";
import { CATEGORY_ICONS } from "../constants";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function TicketCard({ ticket, onDelete }) {
  const icon = CATEGORY_ICONS[ticket.issue_category] || "🎫";
  const excerpt = ticket.description.length > 110 ? ticket.description.slice(0, 110) + "…" : ticket.description;

  return (
    <div className="card flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{ticket.employee_name}</p>
            <p className="text-xs text-gray-500 truncate">{ticket.department}</p>
          </div>
        </div>
        <span className="flex-shrink-0 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
          #{ticket.ticket_id}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-indigo-600 mb-1">{ticket.issue_category}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{excerpt}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        <PriorityBadge value={ticket.priority} />
        <StatusBadge value={ticket.status} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/tickets/${ticket.ticket_id}`}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View →
          </Link>
          <button
            onClick={() => onDelete(ticket.ticket_id)}
            className="text-xs text-red-400 hover:text-red-600 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
