'use client';

import Link from 'next/link';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  HomeIcon,
  PuzzlePieceIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar({
  collapsed,
  isMobileOpen,
  closeMobile,
}: {
  collapsed: boolean;
  isMobileOpen?: boolean;
  closeMobile?: () => void;
}) {
  const links = [
    { href: '/dashboard/analytics', label: 'Analytics', icon: <ChartBarIcon className="w-6 h-6" /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <Cog6ToothIcon className="w-6 h-6" /> },
    { href: '/dashboard/profile', label: 'Profile', icon: <UserIcon className="w-6 h-6" /> },
    { href: '/dashboard/reports', label: 'Reports', icon: <HomeIcon className="w-6 h-6" /> },
    { href: '/dashboard/integrations', label: 'Integrations', icon: <PuzzlePieceIcon className="w-6 h-6" /> },
  ];

  return (
    <aside
      className={`
        fixed z-50 top-0 left-0 h-full transition-transform duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-white dark:bg-gray-900 border-r shadow-lg lg:translate-x-0 lg:relative lg:z-0
      `}
    >
      <div className="p-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {collapsed ? '🚀' : 'MyApp'}
        </span>
        <button className="lg:hidden" onClick={closeMobile}>
          <XMarkIcon className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
      </div>
      <nav className="py-4">
        <ul className="space-y-2">
          {links.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded transition"
              >
                {icon}
                {!collapsed && <span>{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
