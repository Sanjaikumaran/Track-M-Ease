import { useState } from "react";
import { useToast } from "../context/toast";
import Button from "./ui/button";

type ReminderMode = "present" | "signout";

type ReminderModelProps = {
  open: boolean;
  mode: ReminderMode;
  onComplete: () => void;
  onSnooze: () => void;
  distance: number;
  snoozeUntil: number;
};

const ReminderModal = ({
  open,
  mode,
  onComplete,
  onSnooze,
  distance,
  snoozeUntil,
}: ReminderModelProps) => {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  if (!open) return null;

  const isPresent = mode === "present";

  const title = isPresent ? "Office Attendance" : "Work Day Ended";
  const subtitle = isPresent
    ? "You are near office. Please mark attendance. Distance: " +
      distance.toFixed(2) +
      " meters"
    : "Your work hours are over. Please sign out.";

  const completeLabel = isPresent ? "Mark Present" : "Sign Out";
  const toastMsg = isPresent ? "Attendance marked" : "Sign out completed";

  const handleMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const x = e.touches[0].clientX;
    const percent = Math.min(1, x / window.innerWidth);

    setProgress(percent);

    if (percent > 0.85) {
      toast.success(toastMsg);
      setProgress(0);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-[90%] max-w-md bg-white rounded-xl shadow-lg p-6">
        {/* TITLE */}
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>

        {/* SUBTITLE */}
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>

        {/* SLIDER */}
        <div
          onTouchMove={handleMove}
          className="mt-6 relative w-full h-12 bg-gray-100 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress * 100}%` }}
          />

          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-700">
            Slide to {completeLabel} →
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={onSnooze}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
          >
            Snooze ({snoozeUntil} s)
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ReminderModal };
