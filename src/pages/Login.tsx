import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/toast";
import Button from "../components/ui/button";
import { Receipt } from "lucide-react";

export default function Login() {
  const toast = useToast();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signup successful");
  }

  async function handleLogin() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Login successful");
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset email sent");
  }

  return (
    <div className="mx-auto mt-20 max-w-sm rounded-xl bg-white p-6 shadow">
      <h1 className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold">
        <Receipt />

        <span>Track M Ease</span>
      </h1>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
        />

        <Button
          onClick={handleLogin}
          variant="primary"
          disabled={loading}
          className="w-full"
        >
          Login
        </Button>

        <Button
          onClick={handleSignup}
          variant="secondary"
          disabled={loading}
          className="w-full"
        >
          Signup
        </Button>

        <button
          onClick={handleForgotPassword}
          className="w-full text-sm text-blue-600 hover:underline hover:cursor-pointer"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
