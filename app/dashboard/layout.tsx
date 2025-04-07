'use client';

import { useState } from 'react';
import Sidebar from '@/components/SidebarResponsive';
import Topbar from '@/components/TopbarResponsive';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);      // desktop collapse toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);  // mobile open/close toggle

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <Sidebar
        collapsed={collapsed}
        isMobileOpen={sidebarOpen}
        closeMobile={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          toggleSidebar={() => setCollapsed(!collapsed)} // desktop collapse
          openMobile={() => setSidebarOpen(true)}        // mobile open
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
