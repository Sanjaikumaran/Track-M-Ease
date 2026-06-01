import { create } from "zustand";
import { persist } from "zustand/middleware";

type ModalMode = "present" | "signout";

export type AttendanceState =
  | "idle"
  | "tracking"
  | "inside"
  | "outside"
  | "present_done"
  | "signout_pending"
  | "stopped";

type AttendanceStore = {
  state: AttendanceState;

  modalOpen: boolean;
  modalMode: ModalMode;

  presentMarked: boolean;
  presentTime: number | null;

  snoozedUntil: number | null;

  lastSignOutDate: string | null;

  setState: (s: AttendanceState) => void;

  openModal: (mode: ModalMode) => void;
  closeModal: () => void;

  markPresent: () => void;
  markSignOut: () => void;

  snooze: (seconds: number) => void;

  resetDay: () => void;
};

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set) => ({
      state: "idle",

      modalOpen: false,
      modalMode: "present",

      presentMarked: false,
      presentTime: null,

      snoozedUntil: null,

      lastSignOutDate: null,

      setState: (s) => set({ state: s }),

      openModal: (mode) =>
        set({
          modalOpen: true,
          modalMode: mode,
        }),

      closeModal: () =>
        set({
          modalOpen: false,
        }),

      markPresent: () =>
        set({
          presentMarked: true,
          presentTime: Date.now(),
          state: "present_done",
          modalOpen: false,
        }),

      markSignOut: () =>
        set({
          state: "stopped",
          modalOpen: false,
          presentMarked: false,
          presentTime: null,
          snoozedUntil: null,
          lastSignOutDate: new Date().toDateString(),
        }),

      snooze: (seconds) =>
        set({
          modalOpen: false,
          snoozedUntil: Date.now() + seconds * 1000,
        }),
      resetDay: () =>
        set({
          state: "tracking",

          presentMarked: false,
          presentTime: null,

          snoozedUntil: null,

          modalOpen: false,
        }),
    }),
    {
      name: "attendance-storage",
    },
  ),
);
