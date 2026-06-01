import { useCallback, useEffect, useRef } from "react";
import { useConfigStore } from "../store/useConfigStore";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { getDistanceMeters, getInterval } from "../lib/helpers";

export function useAttendanceEngine() {
  const timerRef = useRef<number | null>(null);
  const runRef = useRef<() => void>(() => {});

  const config = useConfigStore((s) => s.config);

  const {
    state,
    setState,
    openModal,

    presentMarked,
    presentTime,

    snoozedUntil,

    lastSignOutDate,

    resetDay,
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

    // Reset next day after signout
    if (
      stateRef.current === "stopped" &&
      lastSignOutDate &&
      lastSignOutDate !== today
    ) {
      resetDay();
      return;
    }

    // Wait until office start time
    if (isBeforeStart()) {
      const ms = getMsUntilStart();

      schedule(Math.max(ms / 1000, 1));

      return;
    }

    // Snoozed
    if (isSnoozed()) {
      schedule(config.snoozeUntil);

      return;
    }

    // Weekend / disabled day
    if (!isWorkingDay()) {
      schedule(3600);

      return;
    }

    // Already signed out today
    if (stateRef.current === "stopped") {
      schedule(3600);

      return;
    }

    // Signout reminder
    if (presentMarked && isAfterWork()) {
      if (stateRef.current !== "signout_pending") {
        setState("signout_pending");
        openModal("signout");
      }

      schedule(300);

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

        const inside = distance <= config.radius;

        console.log({
          distance,
          inside,
          interval,
          state: stateRef.current,
        });

        // Present reminder
        if (!presentMarked && inside && stateRef.current !== "inside") {
          setState("inside");
          openModal("present");
        }

        if (!inside) {
          setState("outside");
        }

        schedule(interval);
      },
      (error) => {
        console.error("Location Error:", error.code, error.message);

        schedule(config.snoozeUntil);
      },
      {
        enableHighAccuracy: true,
      },
    );
  }, [
    config,
    presentMarked,
    presentTime,
    snoozedUntil,
    lastSignOutDate,
    resetDay,
    setState,
    openModal,
  ]);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {
    if (state === "idle") {
      setState("tracking");
    }

    run();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [run, setState, state]);

  return {
    state,
  };
}
