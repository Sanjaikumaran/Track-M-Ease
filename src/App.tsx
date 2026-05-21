import { useEffect, useState, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import { Loader2 } from "lucide-react";

const Transactions = lazy(() => import("./pages/Transactions"));
const Rides = lazy(() => import("./pages/Rides"));
const Shifts = lazy(() => import("./pages/Shifts"));
const Fuels = lazy(() => import("./pages/Fuels"));

const App = () => {
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

  if (!session) {
    return <Login />;
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
          <Route path="/transactions" element={<Transactions />} />

          <Route path="/rides" element={<Rides />} />

          <Route path="/fuel" element={<Fuels />} />

          <Route path="/shifts" element={<Shifts />} />

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
    </Suspense>
  );
};

export default App;
