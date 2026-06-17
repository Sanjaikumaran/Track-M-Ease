import { CheckCircle, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "../../components/ui/button";
import Input from "../../components/ui/input";

const CopyButton = ({ value }: { value: string | null }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={copied}
      className="absolute right-2 top-2 flex items-center gap-2 text-xs hover:underline cursor-pointer"
    >
      <Copy size={14} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const OAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [errors, setErrors] = useState<{
    callbackUrl?: string;
    request?: string;
  }>({});
  const [callbackUrl, setCallbackUrl] = useState(
    "http://localhost:8000/api/oauth/instagram/callback",
  );
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const requestUrl = useMemo(() => {
    try {
      const url = new URL(callbackUrl);
      if (code) {
        url.searchParams.set("code", code);
      }

      if (state) {
        url.searchParams.set("state", state);
      }

      return url.toString();
    } catch {
      return "";
    }
  }, [callbackUrl, code, state]);

  const curl = useMemo(() => {
    if (!requestUrl) {
      return "";
    }

    return ["curl --request GET \\", `--url '${requestUrl}'`].join("\n");
  }, [requestUrl]);

  const copyCurl = async () => {
    if (!curl) return;
    await navigator.clipboard.writeText(curl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleAuth = async () => {
    const nextErrors = {
      callbackUrl: callbackUrl ? undefined : "Required",

      request: !requestUrl ? "Invalid callback URL" : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(requestUrl);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setSuccess(true);
      window.setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setErrors({
        request: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center">
      <div className="mx-auto max-w-7xl rounded-xl bg-white shadow">
        <div className="border-b p-6 text-center">
          <CheckCircle
            className={`mx-auto mb-3 h-10 w-10 ${
              code ? "text-green-500" : "text-red-500"
            }`}
          />

          <h1 className="text-2xl font-bold">Instagram OAuth</h1>
        </div>
        {code && state ? (
          <div className="grid grid-cols-2 gap-6 p-6">
            {/* LEFT */}

            <div className="space-y-4">
              <div className="relative rounded border p-4">
                <h2 className="mb-2 font-semibold">Code</h2>

                <CopyButton value={code} />

                <div className="max-h-48 overflow-auto text-xs break-all">
                  {code}
                </div>
              </div>

              <div className="relative rounded border p-4">
                <h2 className="mb-2 font-semibold">State</h2>

                <CopyButton value={state} />

                <div className="max-h-48 overflow-auto text-xs break-all">
                  {state}
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="space-y-4 relative">
              <Input
                label="Callback URL"
                value={callbackUrl}
                onChange={setCallbackUrl}
                error={errors.callbackUrl}
              />

              <span
                className="absolute right-2 top-0 cursor-pointer hover:underline"
                onClick={() =>
                  setCallbackUrl(
                    "http://localhost:8000/api/oauth/instagram/callback",
                  )
                }
              >
                Reset
              </span>

              <div className="rounded border">
                <div className="flex items-center justify-between border-b p-3">
                  <span className="font-medium">cURL</span>

                  <Button
                    variant="secondary"
                    onClick={copyCurl}
                    disabled={copySuccess}
                  >
                    {copySuccess ? "Copied" : "Copy"}
                  </Button>
                </div>

                <pre className="overflow-auto bg-slate-950 p-4 text-sm text-green-400">
                  {curl}
                </pre>
              </div>

              {errors.request && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-red-600">
                  {errors.request}
                </div>
              )}

              {success && (
                <div className="rounded border border-green-200 bg-green-50 p-3 text-green-600">
                  Connected successfully
                </div>
              )}

              <Button
                onClick={handleAuth}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-center text-red-600">
            No authorization code found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuth;
