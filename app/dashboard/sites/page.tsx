"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SiteDetailPopup from "@/components/SiteDetailPopup";
import SiteFormPopup from "@/components/SiteFormPopup"; // ⬅️ Make sure this path is correct
import { PlusIcon } from "@heroicons/react/24/solid";

export default function SitesPage() {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch sites:", error.message);
    } else {
      setSites(data || []);
    }
  };

  const filteredSites = sites.filter((site) =>
    site.site_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 w-full">
        <input
          type="text"
          placeholder="Search"
          className="flex-grow border px-4 py-2 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-[#0096a2] text-white px-4 py-2 rounded shadow hover:brightness-90 transition flex items-center gap-2"
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
              <th className="px-4 py-4 text-left">Type</th>
              <th className="px-4 py-4 text-left">Prefecture</th>
              <th className="px-4 py-4 text-left">GC Voltage</th>
              <th className="px-4 py-4 text-left">Operator</th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.map((site) => (
              <tr
                key={site.id}
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedSite(site)}
              >
                <td className="px-4 py-3 font-medium text-[#0096a2]">{site.site_name}</td>
                <td className="px-4 py-3">{site.type}</td>
                <td className="px-4 py-3">{site.region}</td>
                <td className="px-4 py-3">{site.grid_connection_voltage}</td>
                <td className="px-4 py-3">{site.operator}</td>
              </tr>
            ))}
            {filteredSites.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No sites found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedSite && (
        <SiteDetailPopup
          site={selectedSite}
          onClose={() => setSelectedSite(null)}
          onEdit={() => {}}
          onDelete={() => {}}
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
