import { useCallback, useEffect, useRef } from "react";
import { useConfigStore } from "../store/useConfigStore";
import { useAttendanceStore } from "../store/useAttendanceStore";
import { getDistanceMeters, getInterval } from "../lib/helpers";

export function useAttendanceEngine() {
  const timerRef = useRef<number | null>(null);
  const runRef = useRef<() => void>(() => {});

  const config = useConfigStore((s) => s.config);

  const { state, setState, openModal } = useAttendanceStore();

  // memory
  const snoozeRef = useRef<number | null>(null);
  const presentRef = useRef(false);

  const schedule = (seconds: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      runRef.current?.();
    }, seconds * 1000);
  };

  const isSnoozed = () =>
    snoozeRef.current !== null && Date.now() < snoozeRef.current;

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
    const now = new Date();
    const [h] = config.startTime.split(":").map(Number);

    const end = new Date();
    end.setHours(h + config.workHours, 0, 0, 0);

    return now >= end;
  };

  const isWorkingDay = () => {
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "short" })
      .toLowerCase();

    return config.enabledDays.includes(today);
  };

  // ---------------------------
  // ACTIONS
  // ---------------------------
  const snooze = (sec: number) => {
    snoozeRef.current = Date.now() + sec * 1000;
  };

  const markPresent = () => {
    presentRef.current = true;
    setState("present_done");
    openModal("signout");
  };

  const markSignOut = () => {
    setState("stopped");
  };

  // ---------------------------
  // MAIN ENGINE
  // ---------------------------
  const run = useCallback(async () => {
    // WAIT UNTIL START
    if (isBeforeStart()) {
      const ms = getMsUntilStart();
      schedule(Math.max(ms / 1000, 1));
      return;
    }

    // SNOOZE
    if (isSnoozed()) {
      schedule(20);
      return;
    }

    // WORK DAY CHECK
    if (!isWorkingDay()) {
      schedule(3600);
      return;
    }

    // AFTER WORK → SIGNOUT
    if (presentRef.current && isAfterWork()) {
      if (state !== "signout_pending") {
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
        console.log(
          "Distance:",
          distance,
          "meters. Next check in",
          interval,
          "seconds.",
        );
        // INSIDE OFFICE → OPEN PRESENT MODAL
        if (!presentRef.current && inside) {
          setState("inside");
          openModal("present");
        }

        if (!inside) setState("outside");

        schedule(interval);
      },
      () => {
        console.log("sdf");
        schedule(20);
      },
      { enableHighAccuracy: true },
    );
  }, [config, state]);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {
    setState("tracking");
    run();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [run]);

  return {
    state,
    snooze,
    markPresent,
    markSignOut,
  };
}
