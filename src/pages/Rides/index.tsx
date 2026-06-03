import { useEffect, useMemo, useRef, useState } from "react";

import SupabaseService from "../../lib/supabase";
import LocalDB from "../../lib/indexDb";

import { useToast } from "../../context/toast";
import { useDeleteConfirmation } from "../../context/deleteEntry";

import GenericFilters from "../../components/filter";
import GenericFormModal from "../../components/form";
import SummaryCardsGrid from "../../components/summaryCard";
import List from "../../components/list";

import { rideFilterConfig, rideFormConfig, rideSummaryConfig } from "./config";
import { formatDate, formatTime12Hour } from "../../lib/helpers";

interface RideEntry {
  id?: string;

  created_at?: string;

  ride_date: string;

  shift_session_id?: string | null;
  shift_sessions?: {
    id: string;
    shift: string;
  } | null;
  ride_type: "passenger" | "parcel";

  earning: number;

  extra_amount?: number;

  commission?: number;

  start_km?: number;

  end_km?: number;

  distance?: number;

  net_profit?: number;

  remarks?: string;

  user_id?: string;

  ride_start_time?: string;

  ride_end_time?: string;

  last_updated_at?: string;
}

type FilterState = {
  rideType: string;
  shift: string;
  startDate: string;
  endDate: string;
  minEarning: string;
  maxEarning: string;
  minNetProfit: string;
  maxNetProfit: string;
  minDistance: string;
  maxDistance: string;
};

const initialForm: RideEntry = {
  ride_date: new Date().toISOString().split("T")[0],
  ride_type: "passenger",
  earning: 0,
  commission: 0,
  extra_amount: 0,
  start_km: 0,
  end_km: 0,
  ride_start_time: new Date().toTimeString().slice(0, 5),
  ride_end_time: "",
  remarks: "",
};

const initialFilters: FilterState = {
  rideType: "all",
  shift: "all",
  startDate: "",
  endDate: "",
  minEarning: "",
  maxEarning: "",
  minNetProfit: "",
  maxNetProfit: "",
  minDistance: "",
  maxDistance: "",
};

const initialErrors = {
  ride_date: "",
  ride_type: "",
  earning: "",
  commission: "",
  extra_amount: "",
  start_km: "",
  end_km: "",
  ride_start_time: "",
  ride_end_time: "",
  remarks: "",
};

const rideService = new SupabaseService<RideEntry>("ride_entries");

const Rides = () => {
  const toast = useToast();
  const { confirmDelete } = useDeleteConfirmation();

  const fetchedRef = useRef(false);

  const [rides, setRides] = useState<RideEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRide, setEditingRide] = useState<RideEntry | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilters);
  const [showDrafts, setShowDrafts] = useState<boolean>(false);

  const fetchRides = async (refresh: boolean = false) => {
    setLoading(true);
    setShowDrafts(false);

    try {
      const { data, error } = await rideService.getAll(
        refresh,
        ["ride_date", "ride_start_time"],
        "desc",
        ["*", "shift_sessions(id, shift)"],
      );

      setRides(data || []);
      if (error) {
        toast.error(error.message);
        return;
      }

      setRides(data || []);
    } catch (err: unknown) {
      toast.error(`${err || "Failed to fetch ride entries"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }

    fetchedRef.current = true;

    fetchRides();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (data: RideEntry) => {
    const newErrors = {
      ride_date: "",
      ride_type: "",
      earning: "",
      commission: "",
      extra_amount: "",
      start_km: "",
      end_km: "",
      ride_start_time: "",
      ride_end_time: "",
      remarks: "",
    };

    if (!data.ride_date) {
      newErrors.ride_date = "Ride date is required";
    }

    if (!data.ride_type) {
      newErrors.ride_type = "Ride type is required";
    }

    if (Number(data.earning) <= 0) {
      newErrors.earning = "Earning must be greater than 0";
    }

    if (Number(data.commission || 0) < 0) {
      newErrors.commission = "Commission cannot be negative";
    }

    if (Number(data.extra_amount || 0) < 0) {
      newErrors.extra_amount = "Extra amount cannot be negative";
    }

    if (data.start_km !== undefined && Number(data.start_km) < 0) {
      newErrors.start_km = "Start KM cannot be negative";
    }

    if (data.end_km !== undefined && Number(data.end_km) < 0) {
      newErrors.end_km = "End KM cannot be negative";
    }

    if (
      data.start_km !== undefined &&
      data.end_km !== undefined &&
      Number(data.end_km) < Number(data.start_km)
    ) {
      newErrors.end_km = "End KM must be greater than Start KM";
    }

    if (!data.ride_start_time?.trim()) {
      newErrors.ride_start_time = "Ride start time is required";
    }

    if (!data.ride_end_time?.trim()) {
      newErrors.ride_end_time = "Ride end time is required";
    }

    if (data.ride_start_time && data.ride_end_time) {
      if (data.ride_end_time < data.ride_start_time) {
        newErrors.ride_end_time = "End time must be greater than start time";
      }
    }

    const currentIndex = rides.findIndex((s) => s.id === editingRide?.id);

    const previousSession =
      currentIndex >= 0 ? rides[currentIndex + 1] : rides[0];

    if (
      !editingRide &&
      data.ride_date === previousSession.ride_date &&
      previousSession?.ride_end_time &&
      data.ride_start_time
    ) {
      const normalize = (t: string) => t.padEnd(8, ":00");

      if (
        normalize(data.ride_start_time) <
        normalize(previousSession.ride_end_time)
      ) {
        newErrors.ride_start_time =
          "Start time must be greater than previous entry (" +
          previousSession.ride_end_time +
          ")";
      }
    }
    if (!editingRide && previousSession?.end_km) {
      if (Number(data.start_km) <= Number(previousSession.end_km)) {
        newErrors.start_km =
          "Start KM must be greater than previous entry (" +
          previousSession.end_km +
          ")";
      }
    }

    if (data.remarks && data.remarks.length > 300) {
      newErrors.remarks = "Remarks cannot exceed 300 characters";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const saveRideEntry = async (data: RideEntry) => {
    if (!validateForm(data)) {
      return false;
    }

    if (showDrafts && editingRide) {
      await LocalDB.remove("rides", editingRide.id!);
    }

    const payload = {
      ride_date: data.ride_date,
      ride_type: data.ride_type,
      earning: data.earning,
      commission: data.commission,
      extra_amount: data.extra_amount,
      start_km: data.start_km,
      end_km: data.end_km,
      ride_start_time: data.ride_start_time,
      ride_end_time: data.ride_end_time,
      remarks: data.remarks,
    };

    try {
      let error;

      if (editingRide && !showDrafts) {
        const res = await rideService.update(editingRide.id!, payload);

        error = res.error;
      } else {
        const res = await rideService.create(payload);

        error = res.error;
      }

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        `Ride entry ${editingRide ? "updated" : "added"} successfully`,
      );

      setEditingRide(null);

      fetchRides(true);
    } catch (err: unknown) {
      toast.error(`${err || "Save failed"}`);
    }
  };

  const deleteRide = async (id: string) => {
    await confirmDelete({
      title: "Delete Ride Entry",
      message: "Are you sure you want to delete this ride entry?",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        const { error } = await rideService.delete(id);

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Ride entry deleted");

        fetchRides();
      },
    });
  };

  const saveAsDraft = async (ride: RideEntry) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

    const draft = {
      ...ride,
      id,
      created_at: new Date().toISOString(),
    };

    await LocalDB.create("rides", draft);

    toast.success("Saved as draft");
  };

  const getAllDrafts = async () => {
    setShowDrafts(true);
    const drafts: RideEntry[] = await LocalDB.getAll("rides");
    drafts.forEach((ride) => {
      ride.net_profit =
        ride.earning - Number(ride.commission) + Number(ride.extra_amount);
      ride.distance = Number(ride.end_km) - Number(ride.start_km);
    });
    setRides(drafts);
  };

  const deleteDraft = async (id: string) => {
    await confirmDelete({
      title: "Delete Ride Draft",
      message: "Are you sure you want to delete this ride draft?",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        await LocalDB.remove("rides", id);

        toast.success("Draft deleted");

        setShowDrafts(false);
        fetchRides();
      },
    });
  };

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const rideTypeMatch =
        appliedFilters.rideType === "all" ||
        ride.ride_type?.toLowerCase() === appliedFilters.rideType.toLowerCase();

      const shiftMatch =
        appliedFilters.shift === "all" ||
        ride.shift_sessions?.shift?.toLowerCase() ===
          appliedFilters.shift.toLowerCase();

      const startDateMatch =
        !appliedFilters.startDate || ride.ride_date >= appliedFilters.startDate;

      const endDateMatch =
        !appliedFilters.endDate || ride.ride_date <= appliedFilters.endDate;

      const earningMatch =
        (!appliedFilters.minEarning ||
          Number(ride.earning) >= Number(appliedFilters.minEarning)) &&
        (!appliedFilters.maxEarning ||
          Number(ride.earning) <= Number(appliedFilters.maxEarning));

      const netProfitMatch =
        (!appliedFilters.minNetProfit ||
          Number(ride.net_profit || 0) >=
            Number(appliedFilters.minNetProfit)) &&
        (!appliedFilters.maxNetProfit ||
          Number(ride.net_profit || 0) <= Number(appliedFilters.maxNetProfit));

      const distanceMatch =
        (!appliedFilters.minDistance ||
          Number(ride.distance || 0) >= Number(appliedFilters.minDistance)) &&
        (!appliedFilters.maxDistance ||
          Number(ride.distance || 0) <= Number(appliedFilters.maxDistance));

      return (
        rideTypeMatch &&
        shiftMatch &&
        startDateMatch &&
        endDateMatch &&
        earningMatch &&
        netProfitMatch &&
        distanceMatch
      );
    });
  }, [rides, appliedFilters]);

  const summary = useMemo(() => {
    return filteredRides.reduce(
      (acc, ride) => {
        acc.rideEarnings += Number(ride.earning || 0);

        acc.totalCommission += Number(ride.commission || 0);

        acc.totalExtra += Number(ride.extra_amount || 0);

        acc.netProfit += Number(ride.net_profit || 0);

        acc.totalKm += Number(ride.distance || 0);

        acc.totalEarnings +=
          Number(ride.earning || 0) + Number(ride.extra_amount || 0);

        return acc;
      },
      {
        totalEarnings: 0,
        totalCommission: 0,
        totalExtra: 0,
        netProfit: 0,
        totalKm: 0,
        rideEarnings: 0,
      },
    );
  }, [filteredRides]);

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Ride Summary</h2>

            <p className="text-sm text-gray-500">Ride earnings overview</p>
          </div>

          <div className="flex gap-2">
            <GenericFilters
              title="Ride Filters"
              filters={appliedFilters}
              setFilters={setAppliedFilters}
              initialFilters={initialFilters}
              config={rideFilterConfig}
            />

            <GenericFormModal
              config={rideFormConfig}
              title={
                editingRide && !showDrafts
                  ? "Edit Ride Entry"
                  : "Add Ride Entry"
              }
              submitLabel={editingRide && !showDrafts ? "Update" : "Save"}
              initialData={initialForm}
              editingData={editingRide || undefined}
              errors={errors}
              onSubmit={saveRideEntry}
              onDraft={!editingRide ? saveAsDraft : undefined}
              onClose={() => {
                setEditingRide(null);
                setErrors(initialErrors);
              }}
            />
          </div>
        </div>

        <SummaryCardsGrid
          loading={loading}
          config={rideSummaryConfig}
          data={{
            totalEarnings: summary.totalEarnings,
            totalCommission: summary.totalCommission,
            totalExtra: summary.totalExtra,
            netProfit: summary.netProfit,
            rideEarnings: summary.rideEarnings,
            totalKm: summary.totalKm,
          }}
          cols={3}
        />
      </div>

      <List
        header="Ride History"
        items={filteredRides}
        loading={loading}
        actions={[
          {
            label: showDrafts ? "Show Online Rides" : "Show Drafts",
            onClick: showDrafts ? fetchRides : getAllDrafts,
            variant: "outline",
          },
        ]}
      >
        {filteredRides.map((ride) => (
          <div
            key={ride.id}
            className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold capitalize text-gray-900">
                  {ride.ride_type}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {formatTime12Hour(ride.ride_start_time)} -{" "}
                  {formatTime12Hour(ride.ride_end_time)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-emerald-600">
                  ₹{Number(ride.net_profit || 0).toFixed(2)}
                </p>

                <p className="text-xs text-gray-400">Net Profit</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Date</p>

                <p className="font-medium text-gray-700">
                  {formatDate(ride.ride_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Distance</p>

                <p className="font-medium text-gray-700">
                  {Number(ride.distance || 0).toFixed(2)} KM
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Earning</p>

                <p className="font-medium text-gray-700">
                  ₹{Number(ride.earning || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Commission</p>

                <p className="font-medium text-gray-700">
                  ₹{Number(ride.commission || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Extra Amount</p>

                <p className="font-medium text-gray-700">
                  ₹{Number(ride.extra_amount || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Shift</p>

                <p className="font-medium text-gray-700 capitalize">
                  {ride.shift_sessions?.shift || "--"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {Number(ride.start_km || 0).toFixed(2)} →&nbsp;
                {Number(ride.end_km || 0).toFixed(2)} KM
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingRide(ride)}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:cursor-pointer hover:bg-blue-100"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (showDrafts) {
                      deleteDraft(ride.id || "");
                      return;
                    }
                    deleteRide(ride.id || "");
                  }}
                  className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:cursor-pointer hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>

            {ride.remarks && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm leading-relaxed text-gray-600">
                  {ride.remarks}
                </p>
              </div>
            )}
          </div>
        ))}
      </List>
    </div>
  );
};

export default Rides;
