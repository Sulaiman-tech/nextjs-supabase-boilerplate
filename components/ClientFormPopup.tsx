'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ClientFormPopup({
  client,
  onClose,
  onSave,
}: {
  client?: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    company_name: '',
    owner: '',
    tax_number: '',
    company_address: '',
    contact_data: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) setFormData(client);
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.company_address.trim()) newErrors.company_address = 'Company address is required';
    if (!formData.contact_data.trim()) newErrors.contact_data = 'Contact data is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const payload = { ...formData };
    let result;

    if (client?.id) {
      result = await supabase.from('clients').update(payload).eq('id', client.id);
    } else {
      result = await supabase.from('clients').insert(payload);
    }

    setLoading(false);
    const { error } = result;
    if (error) {
      alert('Error saving client: ' + error.message);
    } else {
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end sm:p-4 md:p-0 -top-7">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-2xl h-full overflow-y-auto p-6 space-y-4 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0096a2] dark:text-white">
            {client ? 'Edit Client' : 'Add Client'}
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
              name="company_name"
              value={formData.company_name}
              placeholder="Company Name *"
              onChange={handleChange}
              className={`border p-2 rounded text-sm dark:bg-gray-900 ${errors.company_name ? 'border-red-500' : ''}`}
            />
            {errors.company_name && (
              <span className="text-xs text-red-600 mt-1">{errors.company_name}</span>
            )}
          </div>

          <div className="flex flex-col">
            <input
              name="owner"
              value={formData.owner}
              placeholder="Owner"
              onChange={handleChange}
              className="border p-2 rounded text-sm dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col">
            <input
              name="tax_number"
              value={formData.tax_number}
              placeholder="Tax Number"
              onChange={handleChange}
              className="border p-2 rounded text-sm dark:bg-gray-900"
            />
          </div>

          <div className="flex flex-col">
            <input
              name="company_address"
              value={formData.company_address}
              placeholder="Company Address *"
              onChange={handleChange}
              className={`border p-2 rounded text-sm dark:bg-gray-900 ${errors.company_address ? 'border-red-500' : ''}`}
            />
            {errors.company_address && (
              <span className="text-xs text-red-600 mt-1">{errors.company_address}</span>
            )}
          </div>

          <div className="flex flex-col md:col-span-2">
            <input
              name="contact_data"
              value={formData.contact_data}
              placeholder="Contact Data *"
              onChange={handleChange}
              className={`border p-2 rounded text-sm dark:bg-gray-900 ${errors.contact_data ? 'border-red-500' : ''}`}
            />
            {errors.contact_data && (
              <span className="text-xs text-red-600 mt-1">{errors.contact_data}</span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-[#0096a2] text-white px-6 py-2 rounded shadow w-full mt-8"
          >
            {loading ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </div>
    </div>
  );
}