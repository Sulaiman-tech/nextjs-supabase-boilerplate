"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Topbar({
  toggleSidebar,
  openMobile,
}: {
  toggleSidebar: () => void;
  openMobile: () => void;
}) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    getUser();

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; max-age=0; path=/";
    router.push("/login");
  };

  const firstLetter = userEmail?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="h-16 bg-[#f2fafc] dark:bg-gray-900 border-b px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile: open sidebar */}
        <button onClick={openMobile} className="block lg:hidden">
          <Bars3Icon className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>

        {/* Desktop: collapse sidebar */}
        <button onClick={toggleSidebar} className="hidden lg:block">
          <Bars3Icon className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-[#0096a2] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold"
        >
          {firstLetter}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded shadow-lg z-10">
            <ul className="text-sm text-gray-700 dark:text-gray-200">
              <li>
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={toggleTheme}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === "light" ? "Dark" : "Light"} Mode
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
