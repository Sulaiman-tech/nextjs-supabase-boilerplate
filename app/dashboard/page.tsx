'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DashboardPage() {
  const [tickets, setTickets] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [sitesCount, setSitesCount] = useState(0);
  const [statusCount, setStatusCount] = useState({});
  const [ticketsBySite, setTicketsBySite] = useState({});
  const [siteNameMap, setSiteNameMap] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));

    (async () => {
      const { data: ticketsData } = await supabase.from('tickets').select('*');
      const { count: clientsTotal } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      const { count: sitesTotal, data: sitesData } = await supabase
        .from('sites')
        .select('id, site_name', { count: 'exact' });

      setTickets(ticketsData || []);
      setClientsCount(clientsTotal || 0);
      setSitesCount(sitesTotal || 0);

      const nameMap = {};
      sitesData?.forEach((site) => {
        nameMap[site.id] = site.site_name || `Site ${site.id}`;
      });
      setSiteNameMap(nameMap);

      const statusMap = {};
      ticketsData?.forEach((t) => {
        const s = t.status || 'Unknown';
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      setStatusCount(statusMap);

      const siteMap = {};
      ticketsData?.forEach((t) => {
        if (!t.site_id) return;
        siteMap[t.site_id] = (siteMap[t.site_id] || 0) + 1;
      });
      setTicketsBySite(siteMap);
    })();
  }, []);

  const chartText = darkMode ? '#e5e7eb' : '#374151';
  const chartGrid = darkMode ? '#37415133' : '#e5e7eb';

  return (
    <div className="p-6 space-y-10 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard label="Total Tickets" value={tickets.length} href="/dashboard/tickets" />
        <SummaryCard label="Total Clients" value={clientsCount} href="/dashboard/clients" />
        <SummaryCard label="Total Sites" value={sitesCount} href="/dashboard/sites" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md min-h-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Tickets by Status</h2>
          <div className="relative h-[320px]">
            <Pie
              data={{
                labels: Object.keys(statusCount),
                datasets: [
                  {
                    data: Object.values(statusCount),
                    backgroundColor: ['#0096a2', '#facc15', '#10b981', '#f87171', '#6366f1'],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: chartText,
                      font: { size: 14 },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md min-h-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Tickets by Site</h2>
          <div className="relative h-[320px]">
            <Bar
              data={{
                labels: Object.keys(ticketsBySite).map((id) => siteNameMap[id] || `Site ${id}`),
                datasets: [
                  {
                    label: 'Tickets',
                    data: Object.values(ticketsBySite),
                    backgroundColor: '#0096a2',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      precision: 0,
                      color: chartText,
                    },
                    grid: {
                      color: chartGrid,
                    },
                  },
                  x: {
                    ticks: {
                      color: chartText,
                    },
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center hover:shadow-lg transition cursor-pointer hover:scale-[1.02] duration-150">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">{label}</h3>
        <p className="text-3xl font-bold text-[#0096a2] mt-1">{value}</p>
      </div>
    </Link>
  );
}
