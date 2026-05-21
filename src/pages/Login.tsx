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
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
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

    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName,
          phone: phone,
        },
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-4 sm:overflow-hidden">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl sm:max-h-[95vh]">
        {/* Header */}
        <div className="shrink-0 bg-black px-6 py-6 text-white">
          <div className="mb-3 flex items-center justify-center">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <Receipt size={30} />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold">Track M Ease</h1>

          <p className="mt-1 text-center text-xs text-gray-300">
            Track rides, fuel, shifts and transactions easily
          </p>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col p-6">
          {/* Tabs */}
          <div className="mb-5 flex shrink-0 rounded-xl bg-gray-100 p-1">
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

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Display Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                  />
                </div>
              )}

              {mode === "signup" && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <MailCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

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
            </div>
          </div>

          <div className="mt-5 shrink-0 space-y-3 border-t border-gray-100 pt-4">
            <Button
              onClick={mode === "login" ? handleLogin : handleSignup}
              variant="primary"
              disabled={loading}
              className="w-full"
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

            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-gray-400">
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
