import { useState, useEffect } from "react";
import { DEPARTMENTS, ISSUE_CATEGORIES, PRIORITIES, STATUSES } from "../constants";

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const DEFAULT_FORM = {
  employee_name: "",
  department: "",
  issue_category: "VPN Issue",
  description: "",
  priority: "Medium",
  status: "Open",
  resolution_notes: "",
};

function validate(data, isEdit) {
  const errors = {};
  if (!data.employee_name.trim()) errors.employee_name = "Employee name is required";
  else if (data.employee_name.trim().length < 2) errors.employee_name = "Name must be at least 2 characters";
  if (!data.department.trim()) errors.department = "Department is required";
  if (!data.issue_category) errors.issue_category = "Please select a category";
  if (!data.description.trim()) errors.description = "Description is required";
  else if (data.description.trim().length < 10) errors.description = "Description must be at least 10 characters";
  if (!data.priority) errors.priority = "Please select a priority";
  if (isEdit && !data.status) errors.status = "Please select a status";
  return errors;
}

export default function TicketForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(initialData ? { ...DEFAULT_FORM, ...initialData, resolution_notes: initialData.resolution_notes || "" } : DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ ...DEFAULT_FORM, ...initialData, resolution_notes: initialData.resolution_notes || "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const payload = { ...form };
    if (!payload.resolution_notes) payload.resolution_notes = null;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Employee Name" required error={errors.employee_name}>
          <input
            name="employee_name"
            value={form.employee_name}
            onChange={handleChange}
            placeholder="e.g. John Smith"
            className={`input-field ${errors.employee_name ? "border-red-400 ring-red-200" : ""}`}
          />
        </Field>

        <Field label="Department" required error={errors.department}>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className={`input-field ${errors.department ? "border-red-400" : ""}`}
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Issue Category" required error={errors.issue_category}>
          <select
            name="issue_category"
            value={form.issue_category}
            onChange={handleChange}
            className={`input-field ${errors.issue_category ? "border-red-400" : ""}`}
          >
            {ISSUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Priority" required error={errors.priority}>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={`input-field ${errors.priority ? "border-red-400" : ""}`}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Description" required error={errors.description}>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the issue in detail (minimum 10 characters)..."
          className={`input-field resize-none ${errors.description ? "border-red-400" : ""}`}
        />
      </Field>

      {isEdit && (
        <Field label="Status" required error={errors.status}>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={`input-field ${errors.status ? "border-red-400" : ""}`}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      )}

      {isEdit && (
        <Field label="Resolution Notes" error={errors.resolution_notes}>
          <textarea
            name="resolution_notes"
            value={form.resolution_notes}
            onChange={handleChange}
            rows={3}
            placeholder="Add resolution notes or updates..."
            className="input-field resize-none"
          />
        </Field>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : (
            isEdit ? "Save Changes" : "Create Ticket"
          )}
        </button>
      </div>
    </form>
  );
}
