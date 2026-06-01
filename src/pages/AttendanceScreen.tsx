import { ReminderModal } from "../components/ReminderModal";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { useConfigStore } from "../store/useConfigStore";
import { useToast } from "../context/toast";
import { useAttendanceEngine } from "../hooks/useAttendanceEngine";

const AttendanceScreen = () => {
  const toast = useToast();

  const config = useConfigStore((s) => s.config);

  const {
    modalOpen,
    modalMode,
    markPresent,
    markSignOut,
    snooze,
    currentDistance,
  } = useAttendanceStore();

  useAttendanceEngine();

  return (
    <ReminderModal
      open={modalOpen}
      mode={modalMode}
      distance={currentDistance ?? 0}
      snoozeUntil={config.snoozeUntil}
      onComplete={() => {
        if (modalMode === "present") {
          markPresent();
          toast.success("Attendance marked");
        } else {
          markSignOut();
          toast.success("Sign out completed");
        }
      }}
      onSnooze={() => {
        toast.info(`Snoozed for ${config.snoozeUntil} seconds`);

        snooze(config.snoozeUntil);
      }}
    />
  );
};

export default AttendanceScreen;
