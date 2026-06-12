import { useEffect, useState, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase.config";

import AppLayout from "./layouts/AppLayout";

import { useConfigStore } from "./store/useConfigStore";
import { useAttendanceEngine } from "./hooks/useAttendanceEngine";

import Login from "./pages/Login";
import AttendanceScreen from "./pages/AttendanceScreen";

import { requestNotificationPermission } from "./lib/helpers";
import { AttendanceDebugPanel } from "./pages/debug";
import LegalPage from "./pages/PrivacyPolicies";
import OAuth from "./pages/OAuth";

const Transactions = lazy(() => import("./pages/Transactions"));
const Rides = lazy(() => import("./pages/Rides"));
const Shifts = lazy(() => import("./pages/Shifts"));
const Fuels = lazy(() => import("./pages/Fuels"));
const Settings = lazy(() => import("./pages/AttendanceConfig"));

const App = () => {
  useAttendanceEngine();

  const hydrateConfig = useConfigStore((s) => s.hydrateConfig);
  const hydrated = useConfigStore((s) => s.hydrated);

  useEffect(() => {
    hydrateConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        const lock = await navigator.wakeLock.request("screen");

        console.log("Wake Lock active");

        lock.addEventListener("release", () => {
          console.log("Wake Lock released");
        });

        return lock;
      }
    } catch (err) {
      console.error("Wake lock error:", err);
    }
  };

  useEffect(() => {
    requestWakeLock();
  }, []);

  if (!session) {
    return (
      <>
        <Routes>
          <Route path="/privacy-policy" element={<LegalPage />} />
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/data-deletion" element={<LegalPage />} />
          <Route path="/oauth" element={<OAuth />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </>
    );
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin" size={48} />
        </div>
      }
    >
      <Routes>
        <Route element={<AppLayout />}>
          // remove
          <Route path="/debug" element={<AttendanceDebugPanel />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/fuel" element={<Fuels />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/reminder" element={<Settings />} />
          <Route
            path="*"
            element={
              <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="text-7xl font-extrabold text-gray-300">404</div>

                <h1 className="mt-4 text-2xl font-bold text-gray-800">
                  Page Not Found
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  The page you are looking for doesn’t exist or has been moved.
                </p>

                <button
                  onClick={() => (window.location.href = "/")}
                  className="mt-6 rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Go Home
                </button>
              </div>
            }
          />
        </Route>
      </Routes>
      <AttendanceScreen />
    </Suspense>
  );
};

export default App;
