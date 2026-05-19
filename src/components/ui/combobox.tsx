import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

function ComboBoxInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative w-full" ref={ref}>
      <label className="mb-1 block text-sm font-medium">{label}</label>

      <div className="relative">
        <input
          value={search}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
          }}
          className={`w-full rounded-lg border px-3 py-2 pr-8 capitalize ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />

        <ChevronDown
          size={16}
          className="absolute right-2 top-3 text-gray-400"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-lg border bg-white shadow">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No options</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setSearch(opt);
                  setOpen(false);
                }}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 capitalize"
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ComboBoxInput;
