import { create } from "zustand";

type ModalMode = "present" | "signout";

type AttendanceState =
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

  setState: (s: AttendanceState) => void;
  openModal: (mode: ModalMode) => void;
  closeModal: () => void;
};

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  state: "idle",
  modalOpen: false,
  modalMode: "present",

  setState: (s) => set({ state: s }),

  openModal: (mode) => set({ modalOpen: true, modalMode: mode }),

  closeModal: () => set({ modalOpen: false }),
}));
