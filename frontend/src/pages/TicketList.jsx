import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ticketService } from "../services/api";
import TicketCard from "../components/TicketCard";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const DEFAULT_FILTERS = {
  keyword: "",
  category: "",
  status: "",
  priority: "",
  sort_by: "created_at",
  sort_order: "desc",
};

const PAGE_SIZE = 9;

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.priority && { priority: filters.priority }),
      };

      let res;
      if (filters.keyword) {
        res = await ticketService.searchTickets({ ...params, keyword: filters.keyword });
      } else {
        res = await ticketService.getTickets(params);
      }

      setTickets(res.data.tickets);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      toast.error(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await ticketService.deleteTicket(deleteTarget);
      toast.success("Ticket deleted successfully");
      setDeleteTarget(null);
      fetchTickets();
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket");
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasFilters = filters.keyword || filters.category || filters.status || filters.priority;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? "Loading..." : `${total} ticket${total !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <Link to="/tickets/new" className="btn-primary">+ New Ticket</Link>
      </div>

      <div className="mb-5">
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching tickets..." />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={hasFilters ? "🔍" : "🎫"}
          title={hasFilters ? "No matching tickets" : "No tickets yet"}
          description={hasFilters ? "Try adjusting your filters or search term." : "Get started by creating your first support ticket."}
          actionLabel={hasFilters ? undefined : "Create First Ticket"}
          actionTo={hasFilters ? undefined : "/tickets/new"}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.ticket_id} ticket={ticket} onDelete={(id) => setDeleteTarget(id)} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Ticket"
        message={`Are you sure you want to delete ticket #${deleteTarget}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
