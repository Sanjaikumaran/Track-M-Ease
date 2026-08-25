import { useEffect, useRef, useState } from "react";
import { useToast } from "../context/toast";
import Button from "./ui/button";
import { ArrowRight } from "lucide-react";

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
  const sliderRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (!open) return;
    setProgress(0);
    const updateWidth = () =>
      sliderRef.current && setTrackWidth(sliderRef.current.offsetWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [open]);

  useEffect(() => {
    if (open) {
      completedRef.current = false;
      setProgress(0);
    }
  }, [open]);

  if (!open) return null;
  const isPresent = mode === "present";
  const title = isPresent ? "Office Attendance" : "Work Day Ended";
  const subtitle = isPresent
    ? `You are near office. Distance: ${distance.toFixed(2)} meters`
    : "Your work hours are over. Please sign out.";
  const completeLabel = isPresent ? "Mark Present" : "Sign Out";
  const toastMsg = isPresent ? "Attendance marked" : "Sign out completed";
  const completeAction = () => {
    if (completedRef.current) {
      setProgress(0);
      return;
    }
    completedRef.current = true;
    toast.success(toastMsg);
    setProgress(1);
    setTimeout(() => {
      setProgress(0);
      onComplete();
    }, 150);
  };

  const updateProgress = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const thumbWidth = 48;
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / (rect.width - thumbWidth)));
    setProgress(percent);
    if (percent >= 0.85) completeAction();
  };

  const handleTouchStart = () => setDragging(true);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) =>
    updateProgress(e.touches[0].clientX);

  const handleTouchEnd = () => {
    setDragging(false);
    if (progress < 0.85) setProgress(0);
  };

  const handleMouseDown = () => setDragging(true);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) =>
    dragging && updateProgress(e.clientX);

  const handleMouseUp = () => {
    setDragging(false);
    if (progress < 0.85) setProgress(0);
  };

  const thumbTranslate = progress * Math.max(trackWidth - 56, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[90%] max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>

        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

        <div
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative mt-6 h-12 w-full overflow-hidden rounded-full bg-gray-100 select-none"
        >
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-500">
            Slide to {completeLabel}
          </div>
          <div
            className={`absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl text-white shadow-lg ${
              dragging ? "" : "transition-transform duration-300"
            }`}
            style={{
              transform: `translateX(${thumbTranslate}px)`,
            }}
          >
            <ArrowRight />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={onSnooze}
            className="w-full rounded-lg bg-gray-600 py-2 text-white hover:bg-gray-700"
          >
            Snooze ({snoozeUntil}s)
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ReminderModal };
