import { useEffect, useState } from "react";
import { Receipt, MailCheck, ShieldCheck } from "lucide-react";

import { supabase } from "../lib/supabase";

import { useToast } from "../context/toast";

import Button from "../components/ui/button";

type AuthMode = "login" | "signup";

const Login = () => {
  const toast = useToast();

  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("access_token") && hash.includes("type=signup")) {
      toast.success("Email verified successfully. You can now login.");
    }
  }, [toast]);

  const handleSignup = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Signup successful. Please verify your email before logging in.",
    );

    setMode("login");

    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

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
  };

  const handleForgotPassword = async () => {
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
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <div className="bg-black px-8 py-10 text-white">
          <div className="mb-5 flex items-center justify-center">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Receipt size={36} />
            </div>
          </div>

          <h1 className="text-center text-3xl font-bold">Track M Ease</h1>

          <p className="mt-2 text-center text-sm text-gray-300">
            Track rides, fuel, shifts and transactions easily
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition hover:cursor-pointer ${
                mode === "login" ? "bg-white shadow" : "text-gray-500"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition hover:cursor-pointer ${
                mode === "signup" ? "bg-white shadow" : "text-gray-500"
              }`}
            >
              Signup
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>
            )}

            {mode === "signup" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <MailCheck size={20} className="mt-0.5 text-amber-600" />

                  <div>
                    <p className="text-sm font-semibold text-amber-700">
                      Email Verification Required
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-amber-600">
                      After signup, a verification email will be sent to your
                      inbox.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={mode === "login" ? handleLogin : handleSignup}
              variant="primary"
              disabled={loading}
              className="mt-2 w-full"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Create Account"}
            </Button>

            {mode === "login" && (
              <button
                onClick={handleForgotPassword}
                className="w-full text-sm font-medium text-blue-600 transition hover:cursor-pointer hover:underline"
              >
                Forgot Password?
              </button>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-5">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={14} />

              <span>Secure authentication powered by Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
