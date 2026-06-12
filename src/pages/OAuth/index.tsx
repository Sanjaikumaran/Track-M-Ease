import { CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const OAuth = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState(
    "http://localhost:8000/api/oauth/instagram/callback",
  );

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const query = new URLSearchParams(window.location.search);
  const code = query.get("code");

  const handleCopy = async () => {
    if (!code) return;

    await navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  const handleAuth = async () => {
    if (!code) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${callbackUrl}?code=${encodeURIComponent(code)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setSuccess(true);

      setTimeout(() => navigate("/"), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 py-4 px-8">
        <div className="flex flex-col items-center text-center">
          <CheckCircle
            className={`w-14 h-14 mb-4 ${code && code.length > 0 ? "text-green-500" : "text-red-500"}`}
          />

          <h1 className="text-3xl font-bold text-gray-900">
            OAuth {code && code.length > 0 ? "Successful" : "Failed"}
          </h1>

          <p className="text-gray-500 mt-2">
            {code && code.length > 0
              ? "Authorization code received successfully."
              : "Authorization code not received."}
          </p>
        </div>

        {code ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authorization Code
            </label>

            <div className="flex items-center gap-2 bg-gray-50 border rounded-lg pl-3">
              <code className="flex-1 text-sm break-all text-gray-800">
                {code}
              </code>

              <button
                onClick={handleCopy}
                className="hover:cursor-pointer flex items-center gap-2 px-3 py-2 rounded-l-none rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <Copy size={16} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-b">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Exchange Authorization Code
                  </p>
                  <p className="text-xs text-slate-500">
                    Send the OAuth code to your backend
                  </p>
                </div>

                <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                  GET
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Endpoint
                  </label>

                  <Input
                    value={callbackUrl}
                    onChange={setCallbackUrl}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Request Params
                  </label>

                  <pre className="mt-2 rounded-xl bg-slate-900 p-2 text-sm text-green-400 overflow-auto">
                    {JSON.stringify({ code }, null, 2)}
                  </pre>
                </div>

                <Button
                  onClick={handleAuth}
                  variant="primary"
                  disabled={loading}
                  className="w-full h-11 bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  {loading ? "Sending Request..." : "Send Request"}
                </Button>

                {success && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                    Authorization code received successfully.
                  </div>
                )}
                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-center">
            No authorization code found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuth;
