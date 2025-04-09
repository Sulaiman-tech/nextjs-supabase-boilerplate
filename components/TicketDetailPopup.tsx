"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import TicketFormPopup from "@/components/TicketFormPopup";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import jsPDF from "jspdf";

export default function TicketDetailPopup({
  ticket,
  onClose,
  onEdit,
  onDelete,
}) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!ticket) return null;

  const handleDelete = async () => {
    setDeleting(true);

    const filesToDelete = [];
    if (ticket.photo_url)
      filesToDelete.push(`tickets/photos/${ticket.photo_url}`);
    if (ticket.document_url)
      filesToDelete.push(`tickets/docs/${ticket.document_url}`);

    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("saferay")
        .remove(filesToDelete);

      if (storageError) toast.error("Error deleting files.");
    }

    const { error } = await supabase
      .from("tickets")
      .delete()
      .eq("id", ticket.id);
    setDeleting(false);
    setConfirmDelete(false);

    if (error) toast.error("Error deleting ticket.");
    else {
      toast.success("Ticket deleted successfully.");
      onDelete();
      onClose();
    }
  };


const generatePDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor("#0096a2");
  doc.text("Ticket Report", 105, 20, { align: "center" });

  // Basic Info
  doc.setFontSize(12);
  doc.setTextColor(40);

  const addField = (label, value, y) => {
    doc.setFont(undefined, "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont(undefined, "normal");
    doc.text(value || "—", 70, y);
  };

  let y = 35;
  addField("Ticket Number", ticket.ticket_number, y);
  y += 8;
  addField("Ticket Name", ticket.ticket_name, y);
  y += 8;
  addField("Creation Date", ticket.creation_date, y);
  y += 8;
  addField("Closure Date", ticket.closure_date, y);
  y += 8;
  addField("Category", ticket.category, y);
  y += 8;
  addField("Component Type", ticket.component_type, y);
  y += 8;
  addField("Component No", ticket.component_no, y);
  y += 8;
  addField("Error Message", ticket.error_message, y);
  y += 8;
  addField("Availability Loss", ticket.availability_loss?.toString(), y);
  y += 8;
  addField("Downtime Duration", ticket.downtime_duration?.toString(), y);
  y += 8;
  addField("Spare Parts Used", ticket.spare_parts_used, y);
  y += 8;
  addField("Description", ticket.ticket_description, y);
  y += 8;
  addField("Status", ticket.status, y);
  y += 8;
  addField("Sales Amount", ticket.sales_amount?.toString(), y);
  y += 8;
  addField("Invoice Status", ticket.invoice_status, y);
  y += 8;
  addField("Site", ticket.sites?.site_name, y);
  y += 8;
  addField("Client", ticket.clients?.company_name, y);

  // Add image if exists
  if (ticket.photo_url) {
    const imageUrl = `https://YOUR_BUCKET_URL/tickets/photos/${ticket.photo_url}`;

    // Load image as base64 before inserting into PDF
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = function () {
          const base64data = reader.result;
          doc.addPage();
          doc.setFontSize(16);
          doc.text("Attached Photo", 20, 20);
          doc.addImage(base64data, "JPEG", 20, 30, 160, 120);
          doc.save(`${ticket.ticket_name || "ticket"}.pdf`);
        };
        reader.readAsDataURL(blob);
      });
  } else {
    doc.save(`${ticket.ticket_name || "ticket"}.pdf`);
  }
};


  const renderField = (label, value) => (
    <div className="border-b pb-2">
      <span className="block text-xs font-semibold text-gray-500 capitalize">
        {label.replace(/_/g, " ")}
      </span>
      <span className="text-sm break-words">{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="fixed right-0 -top-8 bottom-0 left-0 z-50 bg-black/40 flex justify-end items-start sm:p-4 md:p-0">
      <div className="w-full sm:max-w-4xl sm:w-[48rem] h-full bg-white dark:bg-gray-900 p-4 sm:p-6 overflow-y-auto shadow-xl rounded-xl">
        <div className="flex justify-between items-center mb-8 mt-2">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0096a2] dark:text-white">
            Ticket Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-gray-800 dark:text-gray-200 mb-6 ">
          {[
            "ticket_number",
            "ticket_name",
            "creation_date",
            "closure_date",
            "category",
            "component_type",
            "component_no",
            "error_message",
            "availability_loss",
            "downtime_start",
            "downtime_end",
            "downtime_duration",
            "spare_parts_used",
            "ticket_description",
            "photo_description",
            "status",
            "srs_ond_sales",
            "sales_amount",
            "invoice_date",
            "invoice_status",
          ].map((key) => renderField(key, ticket[key]))}
          {/* Custom render for site and client names */}
          {renderField("site", ticket.sites?.site_name)}
          {renderField("client", ticket.clients?.company_name)}
        </div>

        {ticket.photo_url && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
              Photo
            </h3>
            <img
              src={`https://YOUR_BUCKET_URL/tickets/photos/${ticket.photo_url}`}
              alt="Ticket Photo"
              className="w-full h-40 object-cover rounded"
            />
          </div>
        )}

        {ticket.document_url && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
              Document
            </h3>
            <a
              href={`https://YOUR_BUCKET_URL/tickets/docs/${ticket.document_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              View Document
            </a>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <button
            onClick={() => setShowEditPopup(true)}
            className="bg-[#0096a2] hover:bg-[#007d89] text-white px-6 py-2 rounded shadow w-full"
          >
            Edit Ticket
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow w-full"
          >
            Delete Ticket
          </button>

          <button
            onClick={generatePDF}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded shadow w-full"
          >
            Download PDF
          </button>
        </div>
      </div>

      {showEditPopup && (
        <TicketFormPopup
          ticket={ticket}
          onClose={() => setShowEditPopup(false)}
          onSave={() => {
            setShowEditPopup(false);
            onClose();
            onEdit();
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete{" "}
              <strong>{ticket.ticket_name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
