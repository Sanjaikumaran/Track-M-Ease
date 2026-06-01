import { useState } from "react";

export function SlideToComplete({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  const handleMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const x = e.touches[0].clientX;
    const width = window.innerWidth;

    const percent = Math.min(1, x / width);
    setProgress(percent);

    if (percent > 0.85) {
      onComplete();
      setProgress(0);
    }
  };

  return (
    <div
      onTouchMove={handleMove}
      className="w-80 h-12 bg-gray-800 rounded-full relative overflow-hidden"
    >
      <div
        className="h-full bg-green-500 transition-all"
        style={{ width: `${progress * 100}%` }}
      />

      <div className="absolute inset-0 flex items-center justify-center text-sm">
        Slide to Complete →
      </div>
    </div>
  );
}
