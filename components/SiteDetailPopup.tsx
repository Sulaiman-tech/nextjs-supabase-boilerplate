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
      onDelete(); // This will refresh data in parent without full reload
      onClose(); // Close the popup
    }
  };

  const renderField = (label, value) => (
    <div className="border-b pb-2">
      <span className="block text-xs font-semibold text-gray-500 capitalize">
        {label.replace(/_/g, " ")}
      </span>
      <span className="text-sm break-words">{value || "—"}</span>
    </div>
  );

  return (
    <div className="fixed right-0 -top-8 bottom-0 left-0 z-50 bg-black/40 flex justify-end items-start sm:p-4 md:p-0">
      <div className="w-full sm:max-w-4xl sm:w-[48rem] h-full bg-white dark:bg-gray-900 p-4 sm:p-6 overflow-y-auto overflow-x-hidden shadow-xl rounded-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 mt-2">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0096a2] dark:text-white">
            Site Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Images */}
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

        {/* Document Link */}
        {site.site_documentation_url && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Site Documents
            </h2>
            <a
              href={`${BUCKET_DOCS}/${site.site_documentation_url}`}
              className="text-sm text-blue-600 dark:text-blue-400 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Site Documentation
            </a>
          </div>
        )}

        {/* Site Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-800 dark:text-gray-200 mb-6 pt-6">
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
          ].map((key) => renderField(key, site[key]))}
        </div>

        {/* Checkboxes */}
        <div className="flex gap-4 mb-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPV}
              onChange={() => setShowPV(!showPV)}
              className="h-4 w-4 accent-[#0096a2]"
            />
            <span className="text-sm text-[#0096a2] dark:text-gray-200">
              Show PV Details
            </span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showBESS}
              onChange={() => setShowBESS(!showBESS)}
              className="h-4 w-4 accent-[#0096a2]"
            />
            <span className="text-sm text-[#0096a2] dark:text-gray-200">
              Show BESS Details
            </span>
          </label>
        </div>

        {/* PV and BESS Fields */}
        {(showPV || showBESS) && (
          <div
            className={`grid gap-6 mb-8 ${
              showPV && showBESS ? "sm:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {showPV && (
              <div>
                <h3 className="text-base font-semibold mb-2 text-[#0096a2]">
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
                  ].map((field) => renderField(field, site[field]))}
                </div>
              </div>
            )}
            {showBESS && (
              <div>
                <h3 className="text-base font-semibold mb-2 text-[#0096a2]">
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
                  ].map((field) => renderField(field, site[field]))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <button
            onClick={() => setShowEditPopup(true)}
            className="bg-[#0096a2] hover:bg-[#007d89] text-white px-6 py-2 rounded shadow w-full"
          >
            Edit Site
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow w-full"
          >
            Delete Site
          </button>
        </div>
      </div>

      {/* Edit Popup */}
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{site.site_name}</strong>?
              This action cannot be undone.
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
