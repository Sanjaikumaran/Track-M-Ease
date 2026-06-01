import { useCallback, useEffect, useRef } from "react";
import { useConfigStore } from "../store/useConfigStore";
import { useAttendanceStore } from "../store/useAttendanceStore";
import {
  getDistanceMeters,
  getInterval,
  sendNotification,
} from "../lib/helpers";

const useAttendanceEngine = () => {
  const timerRef = useRef<number | null>(null);
  const runRef = useRef<() => void>(() => { });

  const config = useConfigStore((s) => s.config);

  const {
    state,
    openModal,

    presentMarked,
    presentTime,

    snoozedUntil,

    lastSignOutDate,

    resetDay,
    setCurrentDistance,
  } = useAttendanceStore();

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const schedule = (seconds: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      runRef.current?.();
    }, seconds * 1000);
  };

  const isSnoozed = () => {
    return snoozedUntil !== null && Date.now() < snoozedUntil;
  };

  const isBeforeStart = () => {
    const now = new Date();

    const [h, m] = config.startTime.split(":").map(Number);

    return now.getHours() < h || (now.getHours() === h && now.getMinutes() < m);
  };

  const getMsUntilStart = () => {
    const now = new Date();

    const [h, m] = config.startTime.split(":").map(Number);

    const start = new Date();
    start.setHours(h, m, 0, 0);

    return start.getTime() - now.getTime();
  };

  const isAfterWork = () => {
    if (!presentTime) {
      return false;
    }

    return Date.now() >= presentTime + config.workHours * 60 * 60 * 1000;
  };

  const isWorkingDay = () => {
    const today = new Date()
      .toLocaleDateString("en-US", {
        weekday: "short",
      })
      .toLowerCase();

    return config.enabledDays.includes(today);
  };

  const run = useCallback(async () => {
    const today = new Date().toDateString();

    if (
      stateRef.current === "stopped" &&
      lastSignOutDate &&
      lastSignOutDate !== today
    ) {
      resetDay();
      return;
    }

    if (isBeforeStart()) {
      const ms = getMsUntilStart();

      schedule(Math.max(ms / 1000, 1));

      return;
    }

    if (isSnoozed()) {
      schedule(config.snoozeUntil);

      return;
    }

    if (!isWorkingDay()) {
      schedule(3600);

      return;
    }

    if (stateRef.current === "stopped") {
      schedule(3600);

      return;
    }

    if (presentMarked && isAfterWork()) {
      openModal("signout");

      sendNotification(
        "Sign Out Required",
        "Your work hours are completed. Please sign out.",
      );
      schedule(30);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {

        const distance = getDistanceMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          config.officeLat,
          config.officeLng,
        );



        const interval = getInterval(distance, config.rules);
        setCurrentDistance(distance);

        const inside = distance <= config.radius;

        if (inside) {

          if (!presentMarked && !isSnoozed()) {
            openModal("present");
            sendNotification(
              "Attendance Required",
              "You are near the office. Swipe to mark attendance."
            );
          }

          schedule(interval);
        }
      },
      (error) => {
        console.error("Location Error:", error.code, error.message);

        schedule(config.snoozeUntil);
      },
      {
        enableHighAccuracy: true,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config,
    presentMarked,
    presentTime,
    snoozedUntil,
    lastSignOutDate,
    resetDay,
    openModal,
  ]);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {

    run();

    return () => {

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    state,
  };
};

export { useAttendanceEngine };
