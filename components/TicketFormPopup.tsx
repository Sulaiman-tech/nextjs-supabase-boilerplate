"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function TicketFormPopup({
  ticket,
  onClose,
  onSave,
}: {
  ticket?: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const emptyForm = {
    ticket_number: "",
    ticket_name: "",
    category: [],
    component_type: "",
    component_no: "",
    error_message: "",
    availability_loss: false,
    downtime_start: "",
    downtime_end: "",
    downtime_duration: "",
    spare_parts_used: "",
    ticket_description: "",
    photo_url: "",
    photo_description: "",
    document_url: "",
    allocated_to: "",
    status: "",
    srs_ond_sales: false,
    sales_amount: "",
    client_id: "",
    invoice_date: "",
    invoice_status: "",
    site_id: "",
    creation_date: "",
    closure_date: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const categories = [
    "Electrical",
    "Repair work",
    "Monthly inspection",
    "Annual inspection",
    "Extraordinary inspection",
    "Inverter maintenance",
    "Curtailment",
    "Shutdown by grid operator",
    "SCADA",
    "Weather Sensors",
    "Telecom / Automation",
    "Vegetation",
    "Mechanical",
    "Civil",
    "Natural disaster",
    "Snow",
    "Theft",
    "Security System",
    "Others",
  ];

  useEffect(() => {
    fetchDropdownData();
    if (ticket) setFormData({ ...emptyForm, ...ticket });
    else setFormData(emptyForm);
  }, [ticket]);

  const fetchDropdownData = async () => {
    const [teamsRes, sitesRes, clientsRes] = await Promise.all([
      supabase.from("team").select("id, name"),
      supabase.from("sites").select("id, site_name"),
      supabase.from("clients").select("id, company_name"),
    ]);
    if (!teamsRes.error) setTeams(teamsRes.data);
    if (!sitesRes.error) setSites(sitesRes.data);
    if (!clientsRes.error) setClients(clientsRes.data);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const name = target.name;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.includes(value)
        ? prev.category.filter((v) => v !== value)
        : [...prev.category, value],
    }));
  };

  const calculateDowntime = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = (e.getTime() - s.getTime()) / (1000 * 60);
    return `${Math.floor(diff)} min`;
  };

  const generateTicketNumber = () => {
    const now = new Date();
    return `T-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now
      .getDate()
      .toString()
      .padStart(2, "0")}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.ticket_name.trim())
      newErrors.ticket_name = "Ticket name is required";
    if (!formData.category.length)
      newErrors.category = "At least one category is required";
    if (!formData.site_id) newErrors.site_id = "Site is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    // Define the allowed fields that exist in the Supabase "tickets" table
    const allowedFields = [
      "ticket_number",
      "ticket_name",
      "category",
      "component_type",
      "component_no",
      "error_message",
      "availability_loss",
      "downtime_start",
      "downtime_end",
      "spare_parts_used",
      "ticket_description",
      "photo_url",
      "photo_description",
      "document_url",
      "allocated_to",
      "status",
      "srs_ond_sales",
      "sales_amount",
      "client_id",
      "invoice_date",
      "invoice_status",
      "site_id",
      "creation_date",
      "closure_date",
    ];

    // Only keep valid fields
    const payload: any = {};
    allowedFields.forEach((key) => {
      payload[key] = formData[key as keyof typeof formData];
    });

    // Sanitize data types
    const intFields = ["site_id", "client_id", "allocated_to"];
    const timestampFields = [
      "creation_date",
      "closure_date",
      "downtime_start",
      "downtime_end",
    ];
    const numericFields = ["sales_amount"];
    const dateFields = ["invoice_date"];

    for (const field of [
      ...intFields,
      ...timestampFields,
      ...numericFields,
      ...dateFields,
    ]) {
      if (payload[field] === "") {
        payload[field] = null;
      } else if (intFields.includes(field)) {
        payload[field] = parseInt(payload[field], 10);
      } else if (numericFields.includes(field)) {
        payload[field] = parseFloat(payload[field]);
      }
    }

    // Generate ticket number if creating a new one
    if (!ticket?.id) {
      payload.ticket_number = generateTicketNumber();
    }

    // Auto-fill creation_date if missing
    if (!payload.creation_date) {
      payload.creation_date = new Date().toISOString();
    }

    // Save to Supabase
    const result = ticket?.id
      ? await supabase.from("tickets").update(payload).eq("id", ticket.id)
      : await supabase.from("tickets").insert(payload);

    setLoading(false);

    if (result.error) alert("Error saving: " + result.error.message);
    else {
      onSave();
      onClose();
    }

  };

  return (
    <div
      className={`fixed right-0  bottom-0 left-0 z-50 bg-black/40 flex justify-end items-start sm:p-4 md:p-0 ${
        ticket ? "top-0" : "-top-8"
      }`}
    >
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-4xl sm:w-[48rem] h-full overflow-y-auto p-6 space-y-4 relative overflow-x-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#0096a2] dark:text-white">
            {ticket ? "Edit Ticket" : "Add Ticket"}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <input
          name="ticket_name"
          value={formData.ticket_name}
          onChange={handleChange}
          placeholder="Ticket Name *"
          className={`w-full border p-2 rounded text-sm dark:bg-gray-900 ${
            errors.ticket_name ? "border-red-500" : ""
          }`}
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-1 text-sm text-gray-700 dark:text-white"
            >
              <input
                type="checkbox"
                checked={formData.category.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
                className="accent-[#0096a2]"
              />
              {cat}
            </label>
          ))}
        </div>
        {formData.category.includes("Electrical") && (
          <div className="space-y-2">
            <input
              name="component_type"
              value={formData.component_type}
              onChange={handleChange}
              placeholder="Component Type"
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            />
            <input
              name="component_no"
              value={formData.component_no}
              onChange={handleChange}
              placeholder="Component No."
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            />
            <input
              name="error_message"
              value={formData.error_message}
              onChange={handleChange}
              placeholder="Error Message"
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            />
          </div>
        )}

        <textarea
          name="ticket_description"
          value={formData.ticket_description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="availability_loss"
            checked={formData.availability_loss}
            onChange={handleChange}
            className="accent-[#0096a2]"
          />
          Availability Loss?
        </label>

        {formData.availability_loss && (
          <div className="space-y-2">
            <input
              type="datetime-local"
              name="downtime_start"
              value={formData.downtime_start}
              onChange={handleChange}
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            />
            <input
              type="datetime-local"
              name="downtime_end"
              value={formData.downtime_end}
              onChange={(e) => {
                const end = e.target.value;
                const duration = calculateDowntime(
                  formData.downtime_start,
                  end
                );
                setFormData((prev) => ({
                  ...prev,
                  downtime_end: end,
                  downtime_duration: duration,
                }));
              }}
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            />
            <input
              name="downtime_duration"
              value={formData.downtime_duration}
              readOnly
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
              placeholder="Downtime Duration (calculated)"
            />
          </div>
        )}

        <input
          name="spare_parts_used"
          value={formData.spare_parts_used}
          onChange={handleChange}
          placeholder="Spare Parts Used"
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        />

        <input
          name="photo_description"
          value={formData.photo_description}
          onChange={handleChange}
          placeholder="Photo Description"
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        />
        <input
          name="photo_url"
          value={formData.photo_url}
          onChange={handleChange}
          placeholder="Photo URL"
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        />
        <input
          name="document_url"
          value={formData.document_url}
          onChange={handleChange}
          placeholder="Document URL"
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        />

        <select
          name="allocated_to"
          value={formData.allocated_to}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        >
          <option value="">Select Team Member</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        >
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Closed">Closed</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="srs_ond_sales"
            checked={formData.srs_ond_sales}
            onChange={handleChange}
            className="accent-[#0096a2]"
          />
          SRS OND Sales?
        </label>

        {formData.srs_ond_sales && (
          <div className="space-y-2">
            <input
              name="sales_amount"
              value={formData.sales_amount}
              onChange={handleChange}
              placeholder="Sales Amount (JPY)"
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            />
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleChange}
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            />
            <select
              name="invoice_status"
              value={formData.invoice_status}
              onChange={handleChange}
              className="w-full border p-2 rounded text-sm dark:bg-gray-900"
            >
              <option value="">Select Invoice Status</option>
              <option value="pending">Pending</option>
              <option value="partially invoiced">Partially Invoiced</option>
              <option value="fully invoiced">Fully Invoiced</option>
              <option value="fully paid">Fully Paid</option>
            </select>
          </div>
        )}

        <select
          name="site_id"
          value={formData.site_id}
          onChange={handleChange}
          className={`w-full border p-2 rounded text-sm dark:bg-gray-900 ${
            errors.site_id ? "border-red-500" : ""
          }`}
        >
          <option value="">Select Site</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.site_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="creation_date"
          value={formData.creation_date}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        />
        <input
          type="date"
          name="closure_date"
          value={formData.closure_date}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm dark:bg-gray-900"
        />

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#0096a2] text-white px-6 py-2 rounded shadow w-full"
          >
            {loading ? "Saving..." : "Save Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
