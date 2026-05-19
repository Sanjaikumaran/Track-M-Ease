import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import AddTransaction from "./pages/AddTransaction";
import Rides from "./pages/Rides";
import FuelPage from "./pages/Fuel";

export default function App() {
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
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/fuel" element={<FuelPage />} />
        <Route path="/history" element={<div>History</div>} />
        <Route path="*" element={<div>404</div>} />
      </Route>
    </Routes>
  );
}
