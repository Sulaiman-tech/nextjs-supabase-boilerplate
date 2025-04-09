'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TeamFormPopup({
  member,
  onClose,
  onSave,
}: {
  member?: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    main_location: '',
    contract_type: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) setFormData(member);
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const payload = { ...formData };
    let result;

    if (member?.id) {
      result = await supabase.from('team').update(payload).eq('id', member.id);
    } else {
      result = await supabase.from('team').insert(payload);
    }

    setLoading(false);

    const { error } = result;
    if (error) {
      alert('Error saving member: ' + error.message);
    } else {
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 bg-black/40 flex justify-end items-start sm:p-4 md:p-0 -top-7">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-2xl sm:w-[40rem] h-full overflow-y-auto p-6 space-y-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0096a2] dark:text-white">
            {member ? 'Edit Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              name="name"
              value={formData.name}
              placeholder="Name *"
              onChange={handleChange}
              className={`border p-2 rounded text-sm dark:bg-gray-900 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <span className="text-xs text-red-600 mt-1">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col">
            <input
              name="position"
              value={formData.position}
              placeholder="Position"
              onChange={handleChange}
              className="border p-2 rounded text-sm dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col">
            <input
              name="main_location"
              value={formData.main_location}
              placeholder="Main Location"
              onChange={handleChange}
              className="border p-2 rounded text-sm dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col">
            <select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
              className="border p-2 rounded text-sm dark:bg-gray-900"
            >
              <option value="">Select Contract Type</option>
              <option value="Employee">Employee</option>
              <option value="Contractor">Contractor</option>
            </select>
          </div>

          <div className="flex flex-col">
            <input
              name="email"
              value={formData.email}
              placeholder="Email *"
              onChange={handleChange}
              className={`border p-2 rounded text-sm dark:bg-gray-900 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <span className="text-xs text-red-600 mt-1">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col">
            <input
              name="phone"
              value={formData.phone}
              placeholder="Phone"
              onChange={handleChange}
              className="border p-2 rounded text-sm dark:bg-gray-900"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-[#0096a2] text-white px-6 py-2 rounded shadow w-full mt-8"
          >
            {loading ? 'Saving...' : 'Save Member'}
          </button>
        </div>
      </div>
    </div>
  );
}