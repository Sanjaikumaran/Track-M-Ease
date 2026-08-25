import { useEffect, useMemo, useRef, useState } from "react";
import SupabaseService from "../../lib/supabase";
import LocalDB from "../../lib/indexDb";
import { useToast } from "../../context/toast";
import { useDeleteConfirmation } from "../../context/deleteEntry";
import GenericFilters from "../../components/filter";
import GenericFormModal from "../../components/form";
import SummaryCardsGrid from "../../components/summaryCard";
import List from "../../components/list";

import {
  shiftFilterConfig,
  shiftFormConfig,
  shiftSummaryConfig,
} from "./config";

import {
  calculateHours,
  formatDate,
  formatTime12Hour,
  getShiftByTime,
  getTimeDifference,
} from "../../lib/helpers";
import type { Bikes } from "../Bikes";

interface ShiftSession {
  id?: string;
  created_at?: string;
  shift_date: string;
  shift: "morning" | "afternoon" | "evening" | "night";
  start_km?: number;
  end_km?: number;
  total_distance?: number;
  shift_start_time?: string;
  shift_end_time?: string;
  remarks?: string;
  rides_count?: number;
  user_id?: string;
  average_speed?: number;
  bike?: Bikes | null;
  bike_id?: string | null;
  last_updated_at?: string;
}

type FilterState = {
  shift: string;
  startDate: string;
  endDate: string;
  minDistance: string;
  maxDistance: string;
  bike_id: string | null;
};

const initialForm: ShiftSession = {
  shift_date: new Date().toISOString().split("T")[0],
  shift: getShiftByTime(),
  start_km: 0,
  end_km: 0,
  shift_start_time: new Date().toTimeString().slice(0, 5),
  shift_end_time: "",
  remarks: "",
};

const initialFilters: FilterState = {
  shift: "all",
  startDate: "",
  endDate: "",
  minDistance: "",
  maxDistance: "",
  bike_id: null,
};

const initialErrors = {
  shift_date: "",
  shift: "",
  start_km: "",
  end_km: "",
  shift_start_time: "",
  shift_end_time: "",
  remarks: "",
};

const bikeService = new SupabaseService<Bikes>("bikes");
const shiftService = new SupabaseService<ShiftSession>("shift_sessions");
const ShiftSessions = () => {
  const toast = useToast();
  const { confirmDelete } = useDeleteConfirmation();
  const fetchedRef = useRef(false);
  const [sessions, setSessions] = useState<ShiftSession[]>([]);
  const [bikes, setBikes] = useState<Bikes[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSession, setEditingSession] = useState<ShiftSession | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilters);
  const [showDrafts, setShowDrafts] = useState(false);

  const fetchSessions = async (refresh: boolean = false) => {
    setLoading(true);
    setShowDrafts(false);
    try {
      const { data: bikesData, error: bikesError } =
        await bikeService.getAll(refresh);
      if (bikesError) {
        toast.error(bikesError.message);
        return;
      }
      setBikes(bikesData || []);
      const { data, error } = await shiftService.getAll(
        refresh,
        ["shift_date", "shift_start_time"],
        "desc",
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      const fullData = (data || []).map((session) => ({
        ...session,
        bike: bikesData.find((b) => b.id === session.bike_id) || null,
        average_speed: session.total_distance
          ? Number(session.total_distance || 0) /
              calculateHours(
                session.shift_start_time,
                session.shift_end_time,
              ) || 0
          : 0,
      }));
      setSessions(fullData);
    } catch (err: unknown) {
      toast.error(`${err || "Failed to fetch shift sessions"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (data: ShiftSession) => {
    const newErrors = {
      shift_date: "",
      shift: "",
      start_km: "",
      end_km: "",
      bike_id: "",
      shift_start_time: "",
      shift_end_time: "",
      remarks: "",
    };
    if (!data.shift_date) newErrors.shift_date = "Shift date is required";
    if (!data.shift) newErrors.shift = "Shift is required";
    if (Number(data.start_km || 0) < 0)
      newErrors.start_km = "Start KM cannot be negative";
    if (Number(data.end_km || 0) < 0)
      newErrors.end_km = "End KM cannot be negative";
    if (Number(data.end_km || 0) < Number(data.start_km || 0))
      newErrors.end_km = "End KM must be greater than Start KM";
    if (data.remarks && data.remarks.length > 300)
      newErrors.remarks = "Remarks cannot exceed 300 characters";
    if (!data.bike_id) newErrors.bike_id = "Bike is required";

    const currentIndex = sessions.findIndex((s) => s.id === editingSession?.id);
    const previousSession =
      currentIndex >= 0 ? sessions[currentIndex + 1] : sessions[0];

    if (
      data.bike_id === previousSession?.bike_id &&
      previousSession &&
      Number(data.start_km || 0) < previousSession.end_km!
    )
      newErrors.start_km = `Start KM cannot be less than previous recorded KM (${previousSession.end_km})`;
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const saveSession = async (data: ShiftSession) => {
    if (!validateForm(data)) return false;
    if (showDrafts && editingSession)
      await LocalDB.remove("shifts", editingSession.id!);
    const payload = {
      shift_date: data.shift_date,
      shift: data.shift,
      start_km: data.start_km,
      end_km: data.end_km,
      shift_start_time: data.shift_start_time,
      shift_end_time: data.shift_end_time,
      remarks: data.remarks,
      bike_id: data.bike_id,
    };

    try {
      let res;
      if (editingSession && !showDrafts)
        res = await shiftService.update(editingSession.id!, payload);
      else res = await shiftService.create(payload);

      if (res.error) {
        toast.error(res.error.message);
        return false;
      }
      toast.success(
        `Shift session ${editingSession ? "updated" : "created"} successfully`,
      );
      setEditingSession(null);
      fetchSessions(true);
      return true;
    } catch (err: unknown) {
      toast.error(`${err || "Save failed"}`);
      return false;
    }
  };

  const deleteSession = async (id: string) => {
    await confirmDelete({
      title: "Delete Shift Session",
      message: "Are you sure you want to delete this shift session?",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        const { error } = await shiftService.delete(id);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Shift session deleted");
        fetchSessions();
      },
    });
  };

  const saveAsDraft = async (shift: ShiftSession) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
    const draft = {
      ...shift,
      id,
      created_at: new Date().toISOString(),
    };
    await LocalDB.create("shifts", draft);
    toast.success("Saved as draft");
  };

  const getAllDrafts = async () => {
    setShowDrafts(true);
    const drafts = await LocalDB.getAll("shifts");
    setSessions(drafts || []);
  };

  const deleteDraft = async (id: string) => {
    await confirmDelete({
      title: "Delete Shift Draft",
      message: "Are you sure you want to delete this shift draft?",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        await LocalDB.remove("shifts", id);
        toast.success("Draft deleted");
        setShowDrafts(false);
        fetchSessions();
      },
    });
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const shiftMatch =
        appliedFilters.shift === "all" ||
        session.shift === appliedFilters.shift;
      const startDateMatch =
        !appliedFilters.startDate ||
        session.shift_date >= appliedFilters.startDate;
      const endDateMatch =
        !appliedFilters.endDate || session.shift_date <= appliedFilters.endDate;
      const distanceMatch =
        (!appliedFilters.minDistance ||
          Number(session.total_distance || 0) >=
            Number(appliedFilters.minDistance)) &&
        (!appliedFilters.maxDistance ||
          Number(session.total_distance || 0) <=
            Number(appliedFilters.maxDistance));
      const bike =
        !appliedFilters.bike_id || session.bike_id === appliedFilters.bike_id;
      return (
        shiftMatch && startDateMatch && endDateMatch && distanceMatch && bike
      );
    });
  }, [sessions, appliedFilters]);

  const summary = useMemo(() => {
    const result = filteredSessions.reduce(
      (acc, session) => {
        acc.totalShifts += 1;
        acc.totalDistance += Number(session.total_distance || 0);
        acc.totalHours += calculateHours(
          session.shift_start_time,
          session.shift_end_time,
        );
        return acc;
      },
      {
        totalShifts: 0,
        totalDistance: 0,
        averageSpeed: 0,
        totalHours: 0,
      },
    );
    result.averageSpeed =
      result.totalShifts > 0 ? result.totalDistance / result.totalHours : 0;
    if (isNaN(result.averageSpeed) || !isFinite(result.averageSpeed))
      result.averageSpeed = 0;
    return result;
  }, [filteredSessions]);

  const filterOptions = useMemo(() => {
    return shiftFilterConfig.map((field) => {
      if (field.key === "bike_id") {
        return {
          ...field,
          options: [
            {
              value: "",
              label: "All Bikes",
            },
            ...bikes.map((bike) => ({
              value: bike.id || "",
              label: `${bike.brand} ${bike.model} (${bike.bike_number?.slice(-4)})`,
            })),
          ],
        };
      }
      return field;
    });
  }, [bikes]);

  const formConfig = useMemo(() => {
    return shiftFormConfig.map((field) => {
      if (field.key === "bike_id" && field.type === "select") {
        return {
          ...field,
          options: bikes.map((bike) => ({
            value: bike.id || "",
            label: `${bike.brand} ${bike.model} (${bike.bike_number?.slice(-4)})`,
          })),
        };
      }

      return field;
    });
  }, [bikes]);

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Shift Summary</h2>
            <p className="text-sm text-gray-500">Shift sessions overview</p>
          </div>
          <div className="flex gap-2">
            <GenericFilters
              title="Shift Filters"
              filters={appliedFilters}
              setFilters={setAppliedFilters}
              initialFilters={initialFilters}
              config={filterOptions}
            />
            <GenericFormModal
              config={formConfig}
              title={
                editingSession && !showDrafts
                  ? "Edit Shift Session"
                  : "Add Shift Session"
              }
              initialData={{ ...initialForm, start_km: sessions?.[0]?.end_km }}
              editingData={editingSession || undefined}
              errors={errors}
              onSubmit={saveSession}
              submitLabel={editingSession && !showDrafts ? "Update" : "Save"}
              onDraft={!editingSession ? saveAsDraft : undefined}
              onClose={() => {
                setEditingSession(null);
                setErrors(initialErrors);
              }}
            />
          </div>
        </div>
        <SummaryCardsGrid
          loading={loading}
          config={shiftSummaryConfig}
          data={summary}
          cols={4}
        />
      </div>
      <List
        header="Shift History"
        items={filteredSessions}
        loading={loading}
        actions={[
          {
            label: showDrafts ? "Show Online Shifts" : "Show Drafts",
            onClick: showDrafts ? fetchSessions : getAllDrafts,
            variant: "outline",
          },
        ]}
      >
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold capitalize text-gray-900">
                  {session.shift}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {formatTime12Hour(session.shift_start_time)} -{" "}
                  {formatTime12Hour(session.shift_end_time)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-600">
                  {Number(session.total_distance || 0).toFixed(2)} KM
                </p>
                <p className="text-xs text-gray-400">
                  Timing:{" "}
                  {getTimeDifference(
                    session.shift_start_time,
                    session.shift_end_time,
                  ) || "--"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="font-medium text-gray-700">
                  {formatDate(session.shift_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Bike</p>
                <p className="font-medium capitalize text-emerald-600">
                  {`${session.bike?.brand} ${session.bike?.model} (${session.bike?.bike_number?.slice(-4)})`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Rides</p>
                <p className="font-medium text-gray-700">
                  {session.rides_count || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Average Speed</p>
                <p className="font-medium text-gray-700">
                  {Number(session.average_speed || 0).toFixed(2)} KM/h
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {Number(session.start_km || 0).toFixed(2)} →&nbsp;
                {Number(session.end_km || 0).toFixed(2)} KM
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSession(session)}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:cursor-pointer hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (showDrafts) {
                      deleteDraft(session.id || "");
                      return;
                    }
                    deleteSession(session.id || "");
                  }}
                  className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:cursor-pointer hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
            {session.remarks && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm leading-relaxed text-gray-600">
                  {session.remarks}
                </p>
              </div>
            )}
          </div>
        ))}
      </List>
    </div>
  );
};

export default ShiftSessions;
