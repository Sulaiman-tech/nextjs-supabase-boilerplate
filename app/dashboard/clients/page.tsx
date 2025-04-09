"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import ClientFormPopup from "@/components/ClientFormPopup";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clients").select("*").order("id");
    if (!error) setClients(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (selectedClient?.id) {
      await supabase.from("clients").delete().eq("id", selectedClient.id);
      setSelectedClient(null);
      setShowDeleteConfirm(false);
      fetchClients();
    }
  };

  const filteredClients = clients.filter((c) =>
    c.company_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 w-full">
        <input
          type="text"
          placeholder="Search"
          className="w-full md:flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0096a2] dark:bg-gray-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {
            setSelectedClient(null);
            setShowForm(true);
          }}
          className="bg-[#0096a2] text-white px-4 py-2 rounded shadow flex items-center gap-2 hover:brightness-90"
        >
          <PlusIcon className="w-5 h-5" /> Add Client
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-[#0096a2] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Owner</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Tax Number</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Address</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Contact</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="border-b hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 font-medium text-[#0096a2]">{client.company_name}</td>
                <td className="px-4 py-3 hidden md:table-cell">{client.owner}</td>
                <td className="px-4 py-3 hidden md:table-cell">{client.tax_number}</td>
                <td className="px-4 py-3 hidden md:table-cell">{client.company_address}</td>
                <td className="px-4 py-3 hidden md:table-cell">{client.contact_data}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowForm(true);
                    }}
                    className="text-[#0098a0]"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ClientFormPopup
          client={selectedClient}
          onClose={() => setShowForm(false)}
          onSave={fetchClients}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-sm">
            <p className="text-sm dark:text-white mb-4">
              Are you sure you want to delete{' '}
              <strong>{selectedClient?.company_name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0096a2] border-t-transparent mb-4"></div>
    </div>
  );
}
