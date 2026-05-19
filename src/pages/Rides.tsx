import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import Input from "../components/ui/input";
import Select from "../components/ui/select";
import Textarea from "../components/ui/textarea";
import Modal from "../components/modal";
import Button from "../components/ui/button";
import { Filter, X } from "lucide-react";

interface RideEntry {
  id: string;
  created_at: string;
  ride_date: string;
  shift: "morning" | "afternoon" | "evening" | "night";
  ride_type: "passenger" | "parcel";
  earning: number;
  commission: number;
  extra_amount: number;
  start_km: number | null;
  end_km: number | null;
  distance: number | null;
  net_profit: number | null;
  remarks: string | null;
}

interface RideForm {
  ride_date: string;
  shift: "morning" | "afternoon" | "evening" | "night";
  ride_type: "passenger" | "parcel";
  earning: number;
  commission: number;
  extra_amount: number;
  start_km: number | null;
  end_km: number | null;
  remarks: string;
}

const initialForm: RideForm = {
  ride_date: new Date().toISOString().split("T")[0],
  shift: "morning",
  ride_type: "passenger",
  earning: 0,
  commission: 0,
  extra_amount: 0,
  start_km: null,
  end_km: null,
  remarks: "",
};

export default function Rides() {
  const [rides, setRides] = useState<RideEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    shift: "all",
    rideType: "all",
    startDate: "",
    endDate: "",
    minEarning: "",
    maxEarning: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    shift: "all",
    rideType: "all",
    startDate: "",
    endDate: "",
    minEarning: "",
    maxEarning: "",
  });

  const [filterErrors, setFilterErrors] = useState({
    startDate: "",
    endDate: "",
    minEarning: "",
    maxEarning: "",
  });

  useEffect(() => {
    fetchRides();
  }, []);

  async function fetchRides() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("ride_entries")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setRides((data as RideEntry[]) || []);
    setLoading(false);
  }

  function validateFilters() {
    const errors = {
      startDate: "",
      endDate: "",
      minEarning: "",
      maxEarning: "",
    };

    if (
      filters.startDate &&
      filters.endDate &&
      filters.endDate < filters.startDate
    ) {
      errors.endDate = "End date must be greater than start date";
    }

    if (filters.minEarning && Number(filters.minEarning) < 0) {
      errors.minEarning = "Minimum earning cannot be negative";
    }

    if (filters.maxEarning && Number(filters.maxEarning) < 0) {
      errors.maxEarning = "Maximum earning cannot be negative";
    }

    if (
      filters.minEarning &&
      filters.maxEarning &&
      Number(filters.maxEarning) < Number(filters.minEarning)
    ) {
      errors.maxEarning =
        "Maximum earning must be greater than minimum earning";
    }

    setFilterErrors(errors);

    return !Object.values(errors).some(Boolean);
  }

  function applyFilters() {
    const isValid = validateFilters();

    if (!isValid) {
      return;
    }

    setAppliedFilters(filters);

    setShowFilters(false);
  }
  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      const shiftMatch =
        appliedFilters.shift === "all" || ride.shift === appliedFilters.shift;

      const rideTypeMatch =
        appliedFilters.rideType === "all" ||
        ride.ride_type === appliedFilters.rideType;

      const startDateMatch =
        !appliedFilters.startDate || ride.ride_date >= appliedFilters.startDate;

      const endDateMatch =
        !appliedFilters.endDate || ride.ride_date <= appliedFilters.endDate;

      const earningMatch =
        (!appliedFilters.minEarning ||
          ride.earning >= Number(appliedFilters.minEarning)) &&
        (!appliedFilters.maxEarning ||
          ride.earning <= Number(appliedFilters.maxEarning));

      return (
        shiftMatch &&
        rideTypeMatch &&
        startDateMatch &&
        endDateMatch &&
        earningMatch
      );
    });
  }, [rides, appliedFilters]);
  const summary = useMemo(() => {
    return filteredRides.reduce(
      (acc, ride) => {
        acc.totalEarnings += Number(ride.earning || 0);
        acc.totalCommission += Number(ride.commission || 0);
        acc.totalExtra += Number(ride.extra_amount || 0);
        acc.totalRideEarning +=
          Number(ride.earning || 0) - Number(ride.commission || 0);
        acc.totalKm += Number(ride.distance || 0);
        acc.totalProfit += Number(ride.net_profit || 0);
        acc.totalRides += 1;

        return acc;
      },
      {
        totalEarnings: 0,
        totalCommission: 0,
        totalExtra: 0,
        totalKm: 0,
        totalProfit: 0,
        totalRides: 0,
        totalRideEarning: 0,
      },
    );
  }, [filteredRides]);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-5 py-3.5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Ride Entries</h1>
          <p className="text-sm text-gray-500">Manage your rides</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {showForm && (
          <AddRideForm
            onSuccess={() => {
              fetchRides();
              setShowForm(false);
            }}
            open={showForm}
            setOpen={setShowForm}
          />
        )}

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Summary</h2>
              <p className="text-sm text-gray-500">Ride earnings overview</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <RideFilters
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  filters={filters}
                  setFilters={setFilters}
                  filterErrors={filterErrors}
                  applyFilters={applyFilters}
                  resetFilters={() => {
                    const resetFilters = {
                      shift: "all",
                      rideType: "all",
                      startDate: "",
                      endDate: "",
                      minEarning: "",
                      maxEarning: "",
                    };

                    setFilters(resetFilters);

                    setAppliedFilters(resetFilters);

                    setFilterErrors({
                      startDate: "",
                      endDate: "",
                      minEarning: "",
                      maxEarning: "",
                    });
                  }}
                />
              </div>

              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close" : "Add Ride"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total Earnings"
              value={`₹${summary.totalEarnings.toFixed(2)}`}
            />

            <SummaryCard
              title="Commission"
              value={`₹${summary.totalCommission.toFixed(2)}`}
            />

            <SummaryCard
              title="Extra"
              value={`₹${summary.totalExtra.toFixed(2)}`}
            />

            <SummaryCard
              title="Total Earnings (Incl. Extra, Excl. Commission)"
              value={`₹${summary.totalProfit.toFixed(2)}`}
            />

            <SummaryCard
              title="Total Earnings (Excl. Commission, Extra)"
              value={`₹${summary.totalRideEarning.toFixed(2)}`}
            />

            <SummaryCard title="Total Rides" value={summary.totalRides} />

            <SummaryCard
              title="Total KM"
              value={`${summary.totalKm.toFixed(2)} KM`}
            />
          </div>
        </div>

        <div className="sticky top-[88px] h-[calc(100vh-120px)] overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Ride History</h2>

            <p className="text-sm text-gray-500">
              {filteredRides.length} rides found
            </p>
          </div>

          <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
            <div className="space-y-3">
              {loading && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  Loading...
                </div>
              )}

              {!loading && filteredRides.length === 0 && (
                <div className="rounded-lg border bg-gray-50 p-4 text-gray-500">
                  No rides found
                </div>
              )}

              {filteredRides.map((ride) => (
                <div
                  key={ride.id}
                  className="space-y-3 rounded-lg border bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold capitalize">
                        {ride.ride_type}
                      </h3>

                      <p className="text-sm capitalize text-gray-500">
                        {ride.shift}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">₹{ride.net_profit}</p>

                      <p className="text-xs text-gray-500">Profit</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Earning: ₹{ride.earning}</p>
                    <p>Commission: ₹{ride.commission}</p>
                    <p>Extra: ₹{ride.extra_amount}</p>
                    <p>KM: {ride.distance || 0}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{ride.ride_date}</span>

                    <span>
                      {ride.start_km || 0} → {ride.end_km || 0}
                    </span>
                  </div>

                  {ride.remarks && (
                    <p className="border-t pt-2 text-sm text-gray-600">
                      {ride.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type Filters = {
  shift: string;
  rideType: string;
  startDate: string;
  endDate: string;
  minEarning: string;
  maxEarning: string;
};

type FilterErrors = {
  startDate: string;
  endDate: string;
  minEarning: string;
  maxEarning: string;
};

type RideFiltersProps = {
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filterErrors: FilterErrors;
  applyFilters: () => void;
  resetFilters: () => void;
};

export function RideFilters({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  filterErrors,
  applyFilters,
  resetFilters,
}: RideFiltersProps) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        leftIcon={<Filter size={16} />}
        onClick={() => setShowFilters(!showFilters)}
      >
        Filters
      </Button>

      {showFilters && (
        <div className="absolute right-0 top-12 z-50 w-[340px] space-y-4 rounded-lg border bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>

            <Button onClick={() => setShowFilters(false)} variant="ghost">
              <X size={18} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Shift"
              value={filters.shift}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  shift: value,
                })
              }
              options={[
                { label: "All", value: "all" },
                { label: "Morning", value: "morning" },
                { label: "Afternoon", value: "afternoon" },
                { label: "Evening", value: "evening" },
                { label: "Night", value: "night" },
              ]}
            />

            <Select
              label="Ride Type"
              value={filters.rideType}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  rideType: value,
                })
              }
              options={[
                { label: "All", value: "all" },
                { label: "Passenger", value: "passenger" },
                { label: "Parcel", value: "parcel" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              error={filterErrors.startDate}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  startDate: value,
                })
              }
            />

            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              error={filterErrors.endDate}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  endDate: value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Earning"
              type="number"
              value={filters.minEarning}
              error={filterErrors.minEarning}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  minEarning: value,
                })
              }
            />

            <Input
              label="Max Earning"
              type="number"
              value={filters.maxEarning}
              error={filterErrors.maxEarning}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  maxEarning: value,
                })
              }
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={resetFilters}>
              Reset
            </Button>

            <Button onClick={applyFilters}>Apply</Button>
          </div>
        </div>
      )}
    </div>
  );
}
interface AddRideFormProps {
  onSuccess: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

type RideFormErrors = {
  ride_date?: string;
  shift?: string;
  ride_type?: string;
  earning?: string;
  commission?: string;
  extra_amount?: string;
  start_km?: string;
  end_km?: string;
  remarks?: string;
};

function AddRideForm({ onSuccess, open, setOpen }: AddRideFormProps) {
  const [form, setForm] = useState<RideForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RideFormErrors>({});

  async function validateForm() {
    const newErrors: RideFormErrors = {};
    if (!form.ride_date) {
      newErrors.ride_date = "Ride date is required";
    }

    if (!form.shift) {
      newErrors.shift = "Shift is required";
    }

    if (!form.ride_type) {
      newErrors.ride_type = "Ride type is required";
    }

    if (
      form.earning === null ||
      form.earning === undefined ||
      form.earning === 0
    ) {
      newErrors.earning = "Earning is required";
    } else if (form.earning < 0) {
      newErrors.earning = "Earning cannot be negative";
    }

    if (form.ride_type === "passenger") {
      if (form.commission === null || form.commission === undefined) {
        newErrors.commission = "Commission is required";
      } else if (form.commission <= 0) {
        newErrors.commission = "Commission must be greater than 0";
      }
    }

    if (form.ride_type === "parcel") {
      if (form.commission < 0) {
        newErrors.commission = "Commission cannot be negative";
      }
    }

    if (form.extra_amount < 0) {
      newErrors.extra_amount = "Extra amount cannot be negative";
    }

    if (form.start_km !== null && form.start_km < 0) {
      newErrors.start_km = "Start KM cannot be negative";
    }

    if (form.end_km !== null && form.end_km < 0) {
      newErrors.end_km = "End KM cannot be negative";
    }

    if (form.start_km !== null && form.end_km === null) {
      newErrors.end_km = "End KM is required";
    }

    if (
      form.start_km !== null &&
      form.end_km !== null &&
      form.end_km < form.start_km
    ) {
      newErrors.end_km = "End KM cannot be less than Start KM";
    }

    if (form.remarks.length > 300) {
      newErrors.remarks = "Remarks cannot exceed 300 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function onSubmit() {
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const net_profit = form.earning + form.extra_amount - form.commission;
    console.log({ ...form, user_id: user?.id, net_profit });
    const { error } = await supabase
      .from("ride_entries")
      .insert([{ ...form, user_id: user?.id }]);
    setLoading(false);
    if (error) {
      alert(error.message);

      return;
    }

    alert("Ride added");
    setForm(initialForm);
    onSuccess();
  }
  return (
    <Modal
      open={open}
      title="Add Ride"
      onClose={() => setOpen(false)}
      actions={[
        {
          label: "Cancel",
          variant: "secondary",
          onClick: () => setOpen(false),
        },
        {
          label: "Add Ride",
          type: "submit",
          disabled: loading,
          onClick: onSubmit,
        },
      ]}
    >
      <div className="rounded-l bg-white p-4  space-y-3">
        <div className="grid grid-cols-2 gap-3 ">
          <Input
            label="Ride Date"
            type="date"
            value={form.ride_date}
            onChange={(value) => setForm({ ...form, ride_date: value })}
            error={errors.ride_date}
          />
          <Select
            label="Shift"
            value={form.shift}
            onChange={(value) =>
              setForm({ ...form, shift: value as RideForm["shift"] })
            }
            options={[
              { label: "Morning", value: "morning" },
              { label: "Afternoon", value: "afternoon" },
              { label: "Evening", value: "evening" },
              { label: "Night", value: "night" },
            ]}
            error={errors.shift}
          />
        </div>
        <Select
          label="Ride Type"
          value={form.ride_type}
          onChange={(value) =>
            setForm({ ...form, ride_type: value as RideForm["ride_type"] })
          }
          options={[
            { label: "Passenger", value: "passenger" },
            { label: "Parcel", value: "parcel" },
          ]}
          error={errors.ride_type}
        />
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Earning"
            type="number"
            value={form.earning}
            onChange={(value) => setForm({ ...form, earning: Number(value) })}
            error={errors.earning}
          />
          <Input
            label="Commission"
            type="number"
            value={form.commission}
            onChange={(value) =>
              setForm({ ...form, commission: Number(value) })
            }
            error={errors.commission}
          />
          <Input
            label="Extra"
            type="number"
            value={form.extra_amount}
            onChange={(value) =>
              setForm({ ...form, extra_amount: Number(value) })
            }
            error={errors.extra_amount}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start KM"
            type="number"
            value={form.start_km || ""}
            onChange={(value) =>
              setForm({ ...form, start_km: value ? Number(value) : null })
            }
            error={errors.start_km}
          />
          <Input
            label="End KM"
            type="number"
            value={form.end_km || ""}
            onChange={(value) =>
              setForm({ ...form, end_km: value ? Number(value) : null })
            }
            error={errors.end_km}
          />
        </div>
        <Textarea
          label="Remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(value) => setForm({ ...form, remarks: value })}
          error={errors.remarks}
        />
      </div>
    </Modal>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-l bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="mt-1 text-xl font-bold">{value}</h2>
    </div>
  );
}
