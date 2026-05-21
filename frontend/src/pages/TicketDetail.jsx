import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ticketService } from "../services/api";
import TicketForm from "../components/TicketForm";
import ConfirmModal from "../components/ConfirmModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { CATEGORY_ICONS } from "../constants";
import toast from "react-hot-toast";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-40 flex-shrink-0 pt-0.5">{label}</span>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await ticketService.getTicket(id);
      setTicket(res.data);
    } catch (err) {
      toast.error(err.message || "Ticket not found");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setUpdateLoading(true);
      const res = await ticketService.updateTicket(id, formData);
      setTicket(res.data);
      setIsEditing(false);
      toast.success("Ticket updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update ticket");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await ticketService.deleteTicket(id);
      toast.success("Ticket deleted successfully");
      navigate("/tickets");
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading ticket..." />;
  if (!ticket) return null;

  const icon = CATEGORY_ICONS[ticket.issue_category] || "🎫";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/tickets" className="hover:text-indigo-600">Tickets</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">#{ticket.ticket_id}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div className="flex items-start gap-3">
          <span className="text-3xl mt-0.5">{icon}</span>
          <div>
            <h1 className="page-title">{ticket.issue_category}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {ticket.employee_name} · {ticket.department} · #{ticket.ticket_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-secondary">
                ✏️ Edit
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="btn-danger">
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Edit Ticket</h2>
          <TicketForm
            initialData={ticket}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            loading={updateLoading}
          />
        </div>
      ) : (
        <div className="card">
          <div className="flex flex-wrap gap-2 mb-4">
            <PriorityBadge value={ticket.priority} />
            <StatusBadge value={ticket.status} />
          </div>

          <DetailRow label="Employee">{ticket.employee_name}</DetailRow>
          <DetailRow label="Department">{ticket.department}</DetailRow>
          <DetailRow label="Category">{ticket.issue_category}</DetailRow>
          <DetailRow label="Priority"><PriorityBadge value={ticket.priority} /></DetailRow>
          <DetailRow label="Status"><StatusBadge value={ticket.status} /></DetailRow>
          <DetailRow label="Created At">{formatDate(ticket.created_at)}</DetailRow>
          <DetailRow label="Description">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{ticket.description}</p>
          </DetailRow>
          {ticket.resolution_notes && (
            <DetailRow label="Resolution Notes">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">{ticket.resolution_notes}</p>
              </div>
            </DetailRow>
          )}
        </div>
      )}

      <div className="mt-4">
        <Link to="/tickets" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          ← Back to All Tickets
        </Link>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Ticket"
        message={`Are you sure you want to delete ticket #${ticket.ticket_id}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deleteLoading}
      />
    </div>
  );
}
