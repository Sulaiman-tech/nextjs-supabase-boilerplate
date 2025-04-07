"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import SiteFormPopup from "@/components/SiteFormPopup";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const BUCKET_AERIAL = process.env.NEXT_PUBLIC_SUPABASE_AERIAL_BUCKET;
const BUCKET_LAYOUT = process.env.NEXT_PUBLIC_SUPABASE_LAYOUT_BUCKET;
const BUCKET_DOCS = process.env.NEXT_PUBLIC_SUPABASE_DOCS_BUCKET;

export default function SiteDetailPopup({ site, onClose, onEdit, onDelete }) {
  const [showPV, setShowPV] = useState(false);
  const [showBESS, setShowBESS] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!site) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("sites").delete().eq("id", site.id);

    setDeleting(false);
    setConfirmDelete(false);

    if (error) {
      toast.error("Error deleting site: " + error.message);
    } else {
      toast.success("Site deleted successfully");
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed right-0 -top-9 bottom-0 left-0 z-50 bg-black/40 flex justify-end items-start sm:p-4 md:p-0">
      <div className="w-full sm:max-w-4xl sm:w-[48rem] h-full bg-white dark:bg-gray-900 p-4 sm:p-6 overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
            Site Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Image Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {site.representative_aerial_url && (
            <img
              src={`${BUCKET_AERIAL}/${site.representative_aerial_url}`}
              alt="Aerial"
              className="w-full h-40 sm:h-48 object-cover rounded"
            />
          )}
          {site.representative_layout_url && (
            <img
              src={`${BUCKET_LAYOUT}/${site.representative_layout_url}`}
              alt="Layout"
              className="w-full h-40 sm:h-48 object-cover rounded"
            />
          )}
        </div>

        {site.site_documentation_url && (
          <a
            href={`${BUCKET_DOCS}/${site.site_documentation_url}`}
            className="text-sm text-gray-500 dark:text-gray-400 mb-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${BUCKET_DOCS}/${site.site_documentation_url}`}
          </a>
        )}

        {/* Site Info */}
        <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200 mb-6 pt-6">
          {[
            "site_name",
            "official_name",
            "type",
            "region",
            "address",
            "coordinates",
            "grid_connection_voltage",
            "cee",
            "operator",
          ].map((key) => (
            <div key={key} className="border-b pb-2">
              <span className="block text-xs font-semibold text-gray-500 capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <span className="text-sm break-words">{site[key] || "—"}</span>
            </div>
          ))}
        </div>

        {/* Checkboxes */}
        <div className="flex gap-4 mb-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPV}
              onChange={() => setShowPV(!showPV)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">
              Show PV Details
            </span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBESS}
              onChange={() => setShowBESS(!showBESS)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">
              Show BESS Details
            </span>
          </label>
        </div>

        {/* PV Fields */}
        {showPV && (
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2 text-blue-600">
              PV Details
            </h3>
            <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
              {[
                "dc_capacity",
                "ac_capacity",
                "pcs",
                "pcs_quantity",
                "module",
                "module_quantity",
                "tilt",
                "electricity_selling_rate",
                "cod",
                "site_documentation",
              ].map((field) => (
                <div key={field} className="border-b pb-2">
                  <span className="block text-xs font-semibold text-gray-500 capitalize">
                    {field.replace(/_/g, " ")}
                  </span>
                  <span>{String(site[field]) || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BESS Fields */}
        {showBESS && (
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2 text-blue-600">
              BESS Details
            </h3>
            <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
              {[
                "rated_power",
                "nominal_energy_capacity",
                "operating_capacity",
                "battery",
                "battery_containers_qty",
                "battery_modules_per_rack",
                "c_rate",
                "electricity_selling_rate",
                "cod",
                "site_documentation",
              ].map((field) => (
                <div key={field} className="border-b pb-2">
                  <span className="block text-xs font-semibold text-gray-500 capitalize">
                    {field.replace(/_/g, " ")}
                  </span>
                  <span>{String(site[field]) || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
          <button
            onClick={() => setShowEditPopup(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {showEditPopup && (
        <SiteFormPopup
          site={site}
          onClose={() => setShowEditPopup(false)}
          onSave={() => {
            setShowEditPopup(false);
            onClose();
            onEdit();
          }}
        />
      )}

      {/* Confirm Deletion */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete{" "}
              <strong>{site.site_name}</strong>? This action cannot be undone.
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
