'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import TeamFormPopup from '@/components/TeamFormPopup';

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('team').select('*').order('id');
    if (!error) setTeam(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await supabase.from('team').delete().eq('id', id);
    setShowConfirmDelete(false);
    setSelectedMember(null);
    fetchTeam();
  };

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
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
          onClick={() => {
            setSelectedMember(null);
            setShowForm(true);
          }}
        >
          <PlusIcon className="w-5 h-5" />
          Add Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-[#0096a2] text-white">
            <tr>
              <th className="px-4 py-4 text-left">Name</th>
              <th className="px-4 py-4 text-left  md:table-cell">Position</th>
              <th className="px-4 py-4 text-left hidden md:table-cell">Location</th>
              <th className="px-4 py-4 text-left hidden md:table-cell">Contract</th>
              <th className="px-4 py-4 text-left hidden md:table-cell">Email</th>
              <th className="px-4 py-4 text-left hidden md:table-cell">Phone</th>
              <th className="px-4 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeam.map((member) => (
              <tr
                key={member.id}
                className="border-b hover:bg-gray-100 hover:dark:bg-gray-700"
              >
                <td className="px-4 py-3 font-medium text-[#0096a2]">{member.name}</td>
                <td className="px-4 py-3  md:table-cell">{member.position}</td>
                <td className="px-4 py-3 hidden md:table-cell">{member.main_location}</td>
                <td className="px-4 py-3 hidden md:table-cell">{member.contract_type}</td>
                <td className="px-4 py-3 hidden md:table-cell">{member.email}</td>
                <td className="px-4 py-3 hidden md:table-cell">{member.phone}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowForm(true);
                    }}
                    className="text-[#0098a0]"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setShowConfirmDelete(true);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TeamFormPopup
          member={selectedMember}
          onClose={() => setShowForm(false)}
          onSave={() => {
            fetchTeam();
            setShowForm(false);
          }}
        />
      )}

      {showConfirmDelete && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-sm">
            <p className="text-sm text-gray-800 dark:text-white mb-4">
              Are you sure you want to delete <strong>{selectedMember.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedMember.id)}
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
