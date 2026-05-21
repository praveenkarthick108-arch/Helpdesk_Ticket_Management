import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ticketService } from "../services/api";
import TicketForm from "../components/TicketForm";
import toast from "react-hot-toast";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await ticketService.createTicket(formData);
      toast.success("Ticket created successfully!");
      navigate("/tickets");
    } catch (err) {
      toast.error(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <Link to="/tickets" className="hover:text-indigo-600">Tickets</Link>
            <span>/</span>
            <span className="text-gray-700">New</span>
          </div>
          <h1 className="page-title">Create New Ticket</h1>
          <p className="text-sm text-gray-500 mt-1">Submit a new IT support request</p>
        </div>
      </div>

      <div className="card">
        <TicketForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/tickets")}
          loading={loading}
        />
      </div>
    </div>
  );
}
