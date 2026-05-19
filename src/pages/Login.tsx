import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Signup successful");
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful");
  }

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Rapido Tracker</h1>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>

        <button onClick={handleSignup} className="w-full border p-2 rounded">
          Signup
        </button>
      </div>
    </div>
  );
}
