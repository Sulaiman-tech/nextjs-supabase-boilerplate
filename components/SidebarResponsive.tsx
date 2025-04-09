"use client";

import Link from "next/link";
import {
  BuildingOffice2Icon,
  TicketIcon,
  UserCircleIcon,
  UsersIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Sidebar({
  collapsed,
  isMobileOpen,
  closeMobile,
}: {
  collapsed: boolean;
  isMobileOpen?: boolean;
  closeMobile?: () => void;
}) {
  const pathname = usePathname();

  const [user, setUser] = useState<{ email: string; name?: string } | null>(
    null
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          email: data.user.email,
          name: data.user.user_metadata?.full_name || "User",
        });
      }
    };
    fetchUser();
  }, []);

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <HomeIcon className="w-6 h-6" />,
    },
    {
      href: "/dashboard/sites",
      label: "Sites",
      icon: <BuildingOffice2Icon className="w-6 h-6" />,
    },
    {
      href: "/dashboard/tickets",
      label: "Tickets",
      icon: <TicketIcon className="w-6 h-6" />,
    },
    {
      href: "/dashboard/clients",
      label: "Clients",
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      href: "/dashboard/team",
      label: "Team",
      icon: <UserCircleIcon className="w-6 h-6" />,
    },
  ];

  return (
    <aside
      className={`fixed bg-[#f2fafc] z-50 top-0 left-0 h-full transition-transform duration-300
        ${collapsed ? "w-20" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        bg-[#f2fafc] dark:bg-gray-900 border-r shadow-lg lg:translate-x-0 lg:relative lg:z-0
      `}
    >
      {/* Header */}
      <div className={`${collapsed ? "px-2 pt-4 w-20" : "px-8 pt-4"}`}>
        <img
          src="/saferay-group-logo-light.png"
          alt="Logo Light"
          className="block dark:hidden w-auto h-8"
        />
        <img
          src="/saferay-group-logo-dark.png"
          alt="Logo Dark"
          className="hidden dark:block w-auto h-8"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-center">
        <nav className="py-4 w-full">
          <ul className="space-y-2">
            {links.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-4 rounded transition
                    hover:bg-[#d8f1f5] dark:hover:bg-gray-800 text-gray-900 dark:text-white
                    ${pathname === href ? "bg-[#d8f1f5] dark:bg-gray-800" : ""}
                  `}
                >
                  {icon}
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer – User info */}
      <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700 p-4">
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#0096a2] text-white flex items-center justify-center text-sm font-bold">
              {user.email?.charAt(0).toUpperCase() || "?"}
            </div>

            {/* Name/Email (only if sidebar is expanded) */}
            {!collapsed && (
              <div className="text-sm text-gray-800 dark:text-gray-200">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
