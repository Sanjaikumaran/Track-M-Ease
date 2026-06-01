import { useState } from "react";
import { X } from "lucide-react";

import { useToast } from "../../context/toast";
import { useConfigStore } from "../../store/useConfigStore";

import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

type Rule = {
  minDistance: number;
  interval: number;
};

type ErrorState = {
  office: {
    lat?: string;
    lng?: string;
    radius?: string;
  };
  work: {
    startTime?: string;
    hours?: string;
  };
  rules: Record<number, string>;
};

const Settings = () => {
  const toast = useToast();

  const { config, updateConfig, saveConfig } = useConfigStore();

  const [errors, setErrors] = useState<ErrorState>({
    office: {},
    work: {},
    rules: {},
  });

  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  const toggleDay = (day: string) => {
    const exists = config.enabledDays.includes(day);

    updateConfig({
      enabledDays: exists
        ? config.enabledDays.filter((d) => d !== day)
        : [...config.enabledDays, day],
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateConfig({
          officeLat: pos.coords.latitude,
          officeLng: pos.coords.longitude,
        });

        toast.success("Location updated");
      },
      (err) => {
        console.error(err);
        toast.error("Failed to get location. Enable GPS permission.");
      },
      {
        enableHighAccuracy: true,
      },
    );
  };

  const addRule = () => {
    updateConfig({
      rules: [...config.rules, { minDistance: 0, interval: 0 }],
    });
  };

  const updateRule = (index: number, key: keyof Rule, value: number) => {
    const copy = [...config.rules];

    copy[index] = {
      ...copy[index],
      [key]: value,
    };

    updateConfig({
      rules: copy,
    });
  };

  const removeRule = (index: number) => {
    updateConfig({
      rules: config.rules.filter((_, i) => i !== index),
    });
  };

  const validate = () => {
    const err: ErrorState = {
      office: {},
      work: {},
      rules: {},
    };

    if (
      Number.isNaN(config.officeLat) ||
      config.officeLat < -90 ||
      config.officeLat > 90
    ) {
      err.office.lat = "Latitude must be between -90 and 90";
    }

    if (
      Number.isNaN(config.officeLng) ||
      config.officeLng < -180 ||
      config.officeLng > 180
    ) {
      err.office.lng = "Longitude must be between -180 and 180";
    }

    if (config.radius <= 0) {
      err.office.radius = "Radius must be greater than 0";
    }

    if (!config.startTime) {
      err.work.startTime = "Start time is required";
    }

    if (config.workHours < 1 || config.workHours > 24) {
      err.work.hours = "Work hours must be between 1 and 24";
    }

    if (config.enabledDays.length === 0) {
      toast.error("Select at least one working day");
    }

    const seenDistances = new Set<number>();

    config.rules.forEach((rule, index) => {
      if (rule.minDistance <= 0) {
        err.rules[index] = "Distance must be greater than 0";
        return;
      }

      if (rule.interval <= 0) {
        err.rules[index] = "Interval must be greater than 0";
        return;
      }

      if (seenDistances.has(rule.minDistance)) {
        err.rules[index] = "Duplicate distance rule";
        return;
      }

      seenDistances.add(rule.minDistance);
    });

    setErrors(err);

    const hasError =
      Object.keys(err.office).length > 0 ||
      Object.keys(err.work).length > 0 ||
      Object.keys(err.rules).length > 0;

    return !hasError;
  };

  const saveSettings = async () => {
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      await saveConfig();

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500">
            Configure your attendance system
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Office Settings</h2>

            <Button variant="link" onClick={useCurrentLocation}>
              Use Current Location
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Latitude"
              value={config.officeLat}
              onChange={(v) =>
                updateConfig({
                  officeLat: Number(v),
                })
              }
              error={errors.office.lat}
            />

            <Input
              label="Longitude"
              value={config.officeLng}
              onChange={(v) =>
                updateConfig({
                  officeLng: Number(v),
                })
              }
              error={errors.office.lng}
            />
          </div>

          <Input
            type="number"
            min={0}
            label="Radius (meters)"
            value={config.radius}
            onChange={(v) =>
              updateConfig({
                radius: Number(v),
              })
            }
            error={errors.office.radius}
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <h2 className="font-semibold text-lg">Work Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              type="time"
              label="Start Time"
              value={config.startTime}
              onChange={(v) =>
                updateConfig({
                  startTime: v,
                })
              }
              error={errors.work.startTime}
            />

            <Input
              type="number"
              min={0}
              label="Work Hours"
              value={config.workHours}
              onChange={(v) =>
                updateConfig({
                  workHours: Number(v),
                })
              }
              error={errors.work.hours}
            />
          </div>
          <Input
            type="number"
            min={0}
            label="Snooze Duration (Sec)"
            value={config.snoozeUntil}
            onChange={(v) =>
              updateConfig({
                snoozeUntil: Number(v),
              })
            }
            error={errors.office.radius}
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg">Working Days</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {days.map((day) => (
              <label
                key={day}
                className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={config.enabledDays.includes(day)}
                  onChange={() => toggleDay(day)}
                />

                <span className="text-sm font-medium uppercase">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Distance Rules</h2>

            <Button onClick={addRule} variant="secondary">
              + Add Rule
            </Button>
          </div>

          <div className="space-y-3">
            {config.rules.map((rule, index) => (
              <div
                key={index}
                className="bg-gray-50 border rounded-xl p-3 sm:p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="number"
                    min={0}
                    label="Min Distance (m)"
                    value={rule.minDistance}
                    onChange={(v) =>
                      updateRule(index, "minDistance", Number(v))
                    }
                    helperText={`KM: ${(rule.minDistance / 1000).toFixed(2)}`}
                  />

                  <Input
                    type="number"
                    min={0}
                    label="Interval (sec)"
                    value={rule.interval}
                    onChange={(v) => updateRule(index, "interval", Number(v))}
                    helperText={`Min: ${(rule.interval / 60).toFixed(
                      2,
                    )} | Hr: ${(rule.interval / 3600).toFixed(2)}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Rule #{index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="hover:cursor-pointer flex items-center gap-1 text-red-500 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition"
                  >
                    <X size={16} />
                    Delete
                  </button>
                </div>

                {errors.rules[index] && (
                  <p className="text-xs text-red-500">{errors.rules[index]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Button onClick={saveSettings}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
