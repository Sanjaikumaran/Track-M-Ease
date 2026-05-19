import { Link, Outlet, useLocation } from "react-router-dom";
import {
  X,
  Menu,
  LayoutDashboard,
  Receipt,
  Bike,
  Fuel,
  History,
  LogOut,
  Wallet,
} from "lucide-react";

import { useState } from "react";

import { supabase } from "../lib/supabase";

import Button from "../components/ui/button";

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  headerIcon?: React.ComponentType<{ size?: number }>;
  subHeader?: string;
};

export default function AppLayout() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Transactions",
      path: "/transactions",
      icon: Receipt,
      headerIcon: Wallet,
      subHeader: "Manage your income & expenses",
    },
    {
      label: "Rides",
      path: "/rides",
      icon: Bike,
      headerIcon: Bike,
      subHeader: "Manage your rides",
    },
    {
      label: "Fuel",
      path: "/fuel",
      icon: Fuel,
      headerIcon: Fuel,
      subHeader: "Manage fuel expenses",
    },
    {
      label: "History",
      path: "/history",
      icon: History,
    },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const currentPage = navItems.find((item) => item.path === location.pathname);

  const HeaderIcon = currentPage?.headerIcon;
  return (
    <div className="min-h-screen bg-gray-100">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col border-r bg-white transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h1 className="text-xl font-bold">Track-M-Ease</h1>

            <p className="text-sm text-gray-500">Expense Manager</p>
          </div>

          {/* CLOSE BUTTON MOBILE */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="border-t p-4">
          <Button
            variant="danger"
            fullWidth
            leftIcon={<LogOut size={16} />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="lg:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-5 py-3.5 shadow-sm">
          {/* OPEN SIDEBAR BUTTON */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {HeaderIcon && <HeaderIcon size={34} />}

          <div>
            <h1 className="text-2xl font-bold">{currentPage?.label}</h1>

            <p className="text-sm text-gray-500">{currentPage?.subHeader}</p>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
