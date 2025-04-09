"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SiteDetailPopup from "@/components/SiteDetailPopup";
import SiteFormPopup from "@/components/SiteFormPopup";
import { PlusIcon } from "@heroicons/react/24/solid";

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true); // ⬅️ added loading state

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setLoading(true); // ⬅️ start loading
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch sites:", error.message);
    } else {
      setSites(data || []);
    }

    setLoading(false); // ⬅️ end loading
  };

  const filteredSites = sites.filter((site) =>
    site.site_name?.toLowerCase().includes(search.toLowerCase())
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
          className="bg-[#0096a2] text-white px-4 py-2 rounded shadow hover:brightness-90 transition flex items-center gap-2 self-start md:self-auto"
          onClick={() => setShowAddPopup(true)}
        >
          <PlusIcon className="w-5 h-5" />
          Add Site
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-[#0096a2] text-white">
            <tr>
              <th className="px-4 py-4 text-left">Name</th>
              <th className="px-4 py-4 text-left hidden md:table-cell">Type</th>
              <th className="px-4 py-4 text-left hidden md:table-cell">
                Prefecture
              </th>
              <th className="px-4 py-4 text-left hidden md:table-cell">
                GC Voltage
              </th>
              <th className="px-4 py-4 text-left hidden md:table-cell">
                Operator
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredSites.map((site) => (
              <tr
                key={site.id}
                className="border-b hover:bg-gray-100 hover:dark:bg-gray-600 cursor-pointer"
                onClick={() => setSelectedSite(site)}
              >
                <td className="px-4 py-3 font-medium text-[#0096a2]">
                  {site.site_name}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{site.type}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {site.region}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {site.grid_connection_voltage}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {site.operator}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSite && (
        <SiteDetailPopup
          site={selectedSite}
          onClose={() => setSelectedSite(null)}
          onEdit={fetchSites}
          onDelete={() => {
            fetchSites();
            setSelectedSite(null);
          }}
        />
      )}

      {showAddPopup && (
        <SiteFormPopup
          onClose={() => setShowAddPopup(false)}
          onSave={fetchSites}
        />
      )}
    </div>
  );
}

// ✅ Blue spinning loading animation
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0097a2] border-t-transparent mb-4"></div>
    </div>
  );
}
