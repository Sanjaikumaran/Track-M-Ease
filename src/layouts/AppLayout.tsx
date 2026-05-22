import { Link, Outlet, useLocation } from "react-router-dom";
import {
  X,
  Menu,
  LayoutDashboard,
  Receipt,
  Bike,
  Fuel,
  BellElectric,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";

import Button from "../components/ui/button";
import type { User } from "@supabase/supabase-js";

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  subHeader?: string;
};

const AppLayout = () => {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      subHeader: "Manage your income & expenses",
    },
    {
      label: "Fuel",
      path: "/fuel",
      icon: Fuel,
      subHeader: "Manage fuel expenses",
    },
    {
      label: "Rides",
      path: "/rides",
      icon: Bike,
      subHeader: "Manage your rides",
    },

    {
      label: "Sift Sessions",
      path: "/shifts",
      icon: BellElectric,
      subHeader: "Manage your shift sessions",
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const currentPage = navItems.find((item) => item.path === location.pathname);

  const HeaderIcon = currentPage?.icon;

  return (
    <div className="min-h-[100dvh] bg-gray-100">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-[100dvh] w-72 flex-col overflow-hidden border-r bg-white transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h1 className="text-xl font-bold">Track-M-Ease</h1>

            <p className="text-sm text-gray-500">Expense Manager</p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden hover:cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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

      <div className="lg:ml-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-5 py-[11px] shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden hover:cursor-pointer"
            >
              <Menu size={22} />
            </button>

            {HeaderIcon && <HeaderIcon size={34} />}

            <div>
              <h1 className="text-2xl font-bold">{currentPage?.label}</h1>

              <p className="text-sm text-gray-500">{currentPage?.subHeader}</p>
            </div>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:cursor-pointer hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                <UserIcon size={18} />
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[140px] truncate text-sm font-semibold text-gray-800">
                  {user?.user_metadata?.display_name || "User"}
                </p>
              </div>

              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b bg-gray-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
                      <UserIcon size={24} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {user?.user_metadata?.display_name || "User"}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {user?.email || "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {user?.user_metadata?.phone || "--"}
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    fullWidth
                    leftIcon={<LogOut size={16} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
