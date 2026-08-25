import { create } from "zustand";
import { supabase } from "../lib/supabase.config";

type Rule = {
  minDistance: number;
  interval: number;
};

type Config = {
  officeLat: number;
  officeLng: number;
  radius: number;
  snoozeUntil: number;
  startTime: string;
  workHours: number;
  enabledDays: string[];
  rules: Rule[];
};

type Store = {
  config: Config;
  loading: boolean;
  hydrated: boolean;
  updateConfig: (c: Partial<Config>) => void;
  hydrateConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
};

const defaultConfig: Config = {
  officeLat: 0,
  officeLng: 0,
  radius: 100,
  snoozeUntil: 20,
  startTime: "07:00",
  workHours: 9,
  enabledDays: ["mon", "tue", "wed", "thu", "fri"],
  rules: [
    { minDistance: 10000, interval: 900 },
    { minDistance: 2000, interval: 60 },
    { minDistance: 1000, interval: 30 },
    { minDistance: 100, interval: 10 },
  ],
};

const useConfigStore = create<Store>((set, get) => ({
  config: defaultConfig,
  loading: false,
  hydrated: false,
  updateConfig: (c) =>
    set((state) => ({
      config: {
        ...state.config,
        ...c,
      },
    })),

  hydrateConfig: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user || error) {
        set({ loading: false, hydrated: true });
        return;
      }
      const { data: settings, error: dbError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (dbError || !settings) {
        set({
          config: defaultConfig,
          loading: false,
          hydrated: true,
        });
        return;
      }
      set({
        config: {
          officeLat: settings.office_lat,
          officeLng: settings.office_lng,
          radius: settings.radius,
          snoozeUntil: settings.snooze_until,
          startTime: settings.start_time,
          workHours: settings.work_hours,
          enabledDays: settings.working_days ?? [],
          rules: settings.distance_rules ?? [],
        },
        loading: false,
        hydrated: true,
      });
    } catch {
      set({
        config: defaultConfig,
        loading: false,
        hydrated: true,
      });
    }
  },

  saveConfig: async () => {
    const state = get();
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;
    await supabase.from("user_settings").upsert(
      {
        user_id: user.user.id,
        office_lat: state.config.officeLat,
        office_lng: state.config.officeLng,
        radius: state.config.radius,
        snooze_until: state.config.snoozeUntil,
        start_time: state.config.startTime,
        work_hours: state.config.workHours,
        working_days: state.config.enabledDays,
        distance_rules: state.config.rules,
      },
      {
        onConflict: "user_id",
      },
    );
  },
}));

export { useConfigStore };
export type { Config, Rule };
