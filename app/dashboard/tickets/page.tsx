// TicketPage.tsx (Main Listing Page)
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlusIcon } from "@heroicons/react/24/solid";
import TicketFormPopup from "@/components/TicketFormPopup";
import TicketDetailPopup from "@/components/TicketDetailPopup";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*, sites(site_name), clients(company_name), team(name)")
      .order("creation_date", { ascending: false });
    if (!error) setTickets(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    await supabase.from("tickets").delete().eq("id", id);
    setShowDetails(false);
    fetchTickets();
  };

  const filtered = tickets.filter((ticket) =>
    ticket.ticket_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6">
      {" "}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 w-full">
        <input
          type="text"
          placeholder="Search by ticket name"
          className="w-full md:flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0096a2] dark:bg-gray-900"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-[#0096a2] text-white px-4 py-2 rounded shadow hover:brightness-90 transition flex items-center gap-2 self-start md:self-auto"
          onClick={() => {
            setSelectedTicket(null); // <-- this resets to add mode
            setShowForm(true);
          }}
        >
          <PlusIcon className="w-5 h-5" />
          Add Ticket
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-[#0096a2] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Ticket #</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left hidden md:table-cell">
                Status
              </th>
              <th className="px-4 py-2 text-left hidden md:table-cell">Site</th>
              <th className="px-4 py-2 text-left hidden md:table-cell">
                Client
              </th>
              <th className="px-4 py-2 text-left hidden md:table-cell">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowDetails(true);
                }}
              >
                <td className="px-4 py-2 font-semibold text-[#0096a2]">
                  {ticket.ticket_number}
                </td>
                <td className="px-4 py-2">{ticket.ticket_name}</td>
                <td className="px-4 py-2 hidden md:table-cell">
                  {ticket.status}
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  {ticket.sites?.site_name}
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  {ticket.clients?.company_name}
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  {new Date(ticket.creation_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <TicketFormPopup
          ticket={selectedTicket}
          onClose={() => setShowForm(false)}
          onSave={fetchTickets}
        />
      )}
      {showDetails && selectedTicket && (
        <TicketDetailPopup
          ticket={selectedTicket}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            setShowForm(true);
          }}
          onDelete={() => handleDelete(selectedTicket.id)}
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
