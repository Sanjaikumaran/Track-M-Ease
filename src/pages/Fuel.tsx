import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Fuel, Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";

import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Textarea from "../components/ui/textarea";
import Modal from "../components/modal";
import { useToast } from "../components/toast";
import ConfirmationModal from "../components/confirmation";

interface FuelEntry {
  id: string;
  created_at: string;
  fuel_date: string;
  fuel_time: string;
  litres: number;
  amount: number;
  odometer_km: number | null;
  is_full_tank: boolean;
  remarks: string | null;
  mileage_per_litre?: number | null;
  travelled_km?: number | null;
}

interface FuelFormType {
  fuel_date: string;
  fuel_time: string;
  litres: number;
  amount: number;
  odometer_km: number;
  is_full_tank: boolean;
  remarks: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  fullTankOnly: boolean;
}

const initialForm: FuelFormType = {
  fuel_date: new Date().toISOString().split("T")[0],
  fuel_time: new Date().toTimeString().slice(0, 5),
  litres: 0,
  amount: 0,
  odometer_km: 0,
  is_full_tank: true,
  remarks: "",
};

const initialFilters: FilterState = {
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  fullTankOnly: false,
};

export default function FuelPage() {
  const toast = useToast();
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [form, setForm] = useState<FuelFormType>(initialForm);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);

  const [errors, setErrors] = useState({
    fuel_date: "",
    fuel_time: "",
    litres: "",
    amount: "",
    odometer_km: "",
  });

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilters);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedFuelId, setSelectedFuelId] = useState<string | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }

    fetchedRef.current = true;

    fetchFuelEntries();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFuelEntries() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("fuel_entries")
      .select("*")
      .eq("user_id", user?.id)
      .order("fuel_date", { ascending: false })
      .order("fuel_time", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    } else {
      toast.success("Fuel entries fetched successfully");
    }

    setFuelEntries((data as FuelEntry[]) || []);

    setLoading(false);
  }

  function validateForm() {
    const newErrors = {
      fuel_date: "",
      fuel_time: "",
      litres: "",
      amount: "",
      odometer_km: "",
    };

    if (!form.fuel_date) {
      newErrors.fuel_date = "Fuel date is required";
    }

    if (!form.fuel_time) {
      newErrors.fuel_time = "Fuel time is required";
    }

    if (!form.litres || Number(form.litres) <= 0) {
      newErrors.litres = "Litres must be greater than 0";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (Number(form.odometer_km) <= 0) {
      newErrors.odometer_km = "KM must be greater than 0";
    }

    const latestFuelEntry = fuelEntries[0];

    if (
      latestFuelEntry?.odometer_km &&
      Number(form.odometer_km) <= Number(latestFuelEntry.odometer_km)
    ) {
      newErrors.odometer_km = "Current KM must be greater than previous KM";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  }

  async function saveFuelEntry() {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let error;

    if (editingEntry) {
      const response = await supabase
        .from("fuel_entries")
        .update({
          fuel_date: form.fuel_date,
          fuel_time: form.fuel_time,
          litres: Number(form.litres),
          amount: Number(form.amount),
          odometer_km: Number(form.odometer_km),
          is_full_tank: form.is_full_tank,
          remarks: form.remarks,
        })
        .eq("id", editingEntry.id);

      error = response.error;
    } else {
      const response = await supabase.from("fuel_entries").insert([
        {
          user_id: user?.id,
          fuel_date: form.fuel_date,
          fuel_time: form.fuel_time,
          litres: Number(form.litres),
          amount: Number(form.amount),
          odometer_km: Number(form.odometer_km),
          is_full_tank: form.is_full_tank,
          remarks: form.remarks,
        },
      ]);

      error = response.error;
    }

    if (error) {
      toast.error(error.message);
      return;
    } else {
      toast.success(
        `Fuel entry ${editingEntry ? "updated" : "added"} successfully`,
      );
    }

    setForm(initialForm);

    setEditingEntry(null);

    setShowForm(false);

    fetchFuelEntries();
  }

  function openDeleteModal(id: string) {
    setSelectedFuelId(id);

    setShowDeleteModal(true);
  }
  async function confirmDeleteFuel() {
    if (!selectedFuelId) {
      return;
    }

    setDeleteLoading(true);

    const { error } = await supabase
      .from("fuel_entries")
      .delete()
      .eq("id", selectedFuelId);

    setDeleteLoading(false);

    if (error) {
      toast.error(error.message);

      return;
    }

    toast.success("Fuel entry deleted successfully");

    setShowDeleteModal(false);

    setSelectedFuelId(null);

    fetchFuelEntries();
  }

  function editFuelEntry(entry: FuelEntry) {
    setEditingEntry(entry);

    setForm({
      fuel_date: entry.fuel_date,
      fuel_time: entry.fuel_time,
      litres: Number(entry.litres),
      amount: Number(entry.amount),
      odometer_km: Number(entry.odometer_km || 0),
      is_full_tank: entry.is_full_tank,
      remarks: entry.remarks || "",
    });

    setShowForm(true);
  }

  const filteredFuelEntries = useMemo(() => {
    return fuelEntries.filter((fuel) => {
      const startDateMatch =
        !appliedFilters.startDate || fuel.fuel_date >= appliedFilters.startDate;

      const endDateMatch =
        !appliedFilters.endDate || fuel.fuel_date <= appliedFilters.endDate;

      const amountMatch =
        (!appliedFilters.minAmount ||
          fuel.amount >= Number(appliedFilters.minAmount)) &&
        (!appliedFilters.maxAmount ||
          fuel.amount <= Number(appliedFilters.maxAmount));

      const fullTankMatch = !appliedFilters.fullTankOnly || fuel.is_full_tank;

      return startDateMatch && endDateMatch && amountMatch && fullTankMatch;
    });
  }, [fuelEntries, appliedFilters]);

  const fuelEntriesWithMileage = useMemo(() => {
    const sortedEntries = [...filteredFuelEntries].sort((a, b) => {
      const current = new Date(
        `${a.fuel_date}T${a.fuel_time || "00:00"}`,
      ).getTime();

      const next = new Date(
        `${b.fuel_date}T${b.fuel_time || "00:00"}`,
      ).getTime();

      return current - next;
    });

    const calculatedEntries = sortedEntries.map((entry, index) => {
      if (index === 0) {
        return {
          ...entry,
          mileage_per_litre: null,
          travelled_km: null,
        };
      }

      const previous = sortedEntries[index - 1];

      const currentKm = Number(entry.odometer_km || 0);

      const previousKm = Number(previous.odometer_km || 0);

      const travelledKm = currentKm - previousKm;

      const mileage =
        previous.litres > 0 ? travelledKm / Number(previous.litres) : null;

      return {
        ...entry,
        travelled_km: travelledKm > 0 ? travelledKm : null,
        mileage_per_litre: mileage && mileage > 0 ? mileage : null,
      };
    });

    return calculatedEntries.reverse();
  }, [filteredFuelEntries]);

  const summary = useMemo(() => {
    return fuelEntriesWithMileage.reduce(
      (acc, fuel) => {
        acc.totalFuelCost += Number(fuel.amount || 0);

        acc.totalLitres += Number(fuel.litres || 0);

        acc.totalEntries += 1;

        if (fuel.travelled_km) {
          acc.totalTravelledKm += Number(fuel.travelled_km);
        }

        if (fuel.mileage_per_litre) {
          acc.totalMileage += Number(fuel.mileage_per_litre);

          acc.mileageCount += 1;
        }

        return acc;
      },
      {
        totalFuelCost: 0,
        totalLitres: 0,
        totalEntries: 0,
        totalMileage: 0,
        mileageCount: 0,
        totalTravelledKm: 0,
      },
    );
  }, [fuelEntriesWithMileage]);

  const averageMileage =
    summary.mileageCount > 0 ? summary.totalMileage / summary.mileageCount : 0;

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b bg-white px-5 py-3.5 shadow-sm">
        <Fuel size={40} />

        <div>
          <h1 className="text-2xl font-bold">Fuel Entries</h1>

          <p className="text-sm text-gray-500">Manage fuel expenses</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Fuel Summary</h2>
            </div>

            <div className="flex items-center gap-2">
              <FuelFilters
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filters={filters}
                setFilters={setFilters}
                setAppliedFilters={setAppliedFilters}
              />

              <Button
                leftIcon={<Plus size={18} />}
                onClick={() => setShowForm(true)}
              >
                Add Fuel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              title="Fuel Cost"
              value={`₹${summary.totalFuelCost.toFixed(2)}`}
            />

            <SummaryCard
              title="Total Litres"
              value={`${summary.totalLitres.toFixed(2)} L`}
            />

            <SummaryCard
              title="Travelled KM"
              value={`${summary.totalTravelledKm.toFixed(2)} KM`}
            />

            <SummaryCard
              title="Avg Mileage"
              value={`${averageMileage.toFixed(2)} KM/L`}
            />

            <SummaryCard title="Entries" value={summary.totalEntries} />
          </div>
        </div>

        <div className="sticky top-[88px] h-[calc(100vh-120px)] overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b px-4 py-3">
            <h2 className="text-lg font-semibold">Fuel History</h2>

            <p className="text-sm text-gray-500">
              {fuelEntriesWithMileage.length} entries found
            </p>
          </div>

          <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
            <div className="space-y-3">
              {loading && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  Loading...
                </div>
              )}

              {!loading && fuelEntriesWithMileage.length === 0 && (
                <div className="rounded-lg border bg-gray-50 p-4 text-gray-500">
                  No fuel entries found
                </div>
              )}

              {fuelEntriesWithMileage.map((fuel) => (
                <div
                  key={fuel.id}
                  className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        ₹{Number(fuel.amount).toFixed(2)}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {fuel.litres} Litres
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-semibold text-indigo-600">
                        ₹
                        {(Number(fuel.amount) / Number(fuel.litres)).toFixed(2)}
                        /L
                      </p>

                      <p className="text-xs text-gray-400">Price per litre</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Date</p>

                      <p className="font-medium text-gray-700">
                        {fuel.fuel_date}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Time</p>

                      <p className="font-medium text-gray-700">
                        {fuel.fuel_time}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Odometer</p>

                      <p className="font-medium text-gray-700">
                        {fuel.odometer_km || 0} KM
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Travelled</p>

                      <p className="font-medium text-gray-700">
                        {fuel.travelled_km
                          ? `${fuel.travelled_km.toFixed(2)} KM`
                          : "-"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Mileage</p>

                      <p className="font-semibold text-emerald-600">
                        {fuel.mileage_per_litre
                          ? `${fuel.mileage_per_litre.toFixed(2)} KM/L`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        fuel.is_full_tank
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {fuel.is_full_tank ? "Full Tank" : "Partial Tank"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editFuelEntry(fuel)}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:cursor-pointer hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => openDeleteModal(fuel.id)}
                        className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:cursor-pointer hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {fuel.remarks && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-sm leading-relaxed text-gray-600">
                        {fuel.remarks}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        open={showDeleteModal}
        title="Delete Fuel Entry"
        message="Are you sure you want to delete this fuel entry?"
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteFuel}
      />
      <FuelFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        form={form}
        setForm={setForm}
        errors={errors}
        onSubmit={saveFuelEntry}
        editingEntry={editingEntry}
      />
    </>
  );
}

function FuelFilters({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  setAppliedFilters,
}: {
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setAppliedFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}) {
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
        <div className="absolute right-0 top-12 z-50 w-[320px] space-y-4 rounded-lg border bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>

            <button
              onClick={() => setShowFilters(false)}
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
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
              label="Min Amount"
              type="number"
              value={filters.minAmount}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  minAmount: value,
                })
              }
            />

            <Input
              label="Max Amount"
              type="number"
              value={filters.maxAmount}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  maxAmount: value,
                })
              }
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setFilters({
                ...filters,
                fullTankOnly: !filters.fullTankOnly,
              })
            }
            className={`flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all ${
              filters.fullTankOnly
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {filters.fullTankOnly ? "Showing Full Tank Only" : "All Fuel Types"}
          </button>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setFilters(initialFilters);

                setAppliedFilters(initialFilters);
              }}
            >
              Reset
            </Button>

            <Button
              onClick={() => {
                setAppliedFilters(filters);

                setShowFilters(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FuelFormModal({
  open,
  onClose,
  form,
  setForm,
  errors,
  onSubmit,
  editingEntry,
}: {
  open: boolean;
  onClose: () => void;
  form: FuelFormType;
  setForm: React.Dispatch<React.SetStateAction<FuelFormType>>;
  errors: {
    fuel_date: string;
    fuel_time: string;
    litres: string;
    amount: string;
    odometer_km: string;
  };
  onSubmit: () => void;
  editingEntry: FuelEntry | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingEntry ? "Edit Fuel Entry" : "Add Fuel Entry"}
      actions={[
        {
          label: "Cancel",
          variant: "secondary",
          onClick: onClose,
        },
        {
          label: editingEntry ? "Update Fuel" : "Save Fuel",
          onClick: onSubmit,
        },
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fuel Date"
            type="date"
            value={form.fuel_date}
            error={errors.fuel_date}
            onChange={(value) =>
              setForm({
                ...form,
                fuel_date: value,
              })
            }
          />

          <Input
            label="Fuel Time"
            type="time"
            value={form.fuel_time}
            error={errors.fuel_time}
            onChange={(value) =>
              setForm({
                ...form,
                fuel_time: value,
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Litres"
            type="number"
            value={form.litres}
            error={errors.litres}
            onChange={(value) =>
              setForm({
                ...form,
                litres: Number(value),
              })
            }
          />

          <Input
            label="Amount"
            type="number"
            value={form.amount}
            error={errors.amount}
            onChange={(value) =>
              setForm({
                ...form,
                amount: Number(value),
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Bike KM"
            type="number"
            value={form.odometer_km}
            error={errors.odometer_km}
            onChange={(value) =>
              setForm({
                ...form,
                odometer_km: Number(value),
              })
            }
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Fuel Type
            </label>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  is_full_tank: !form.is_full_tank,
                })
              }
              className={`flex h-10 items-center justify-center hover:cursor-pointer rounded-lg px-4 text-sm font-semibold transition-all duration-300 ${
                form.is_full_tank
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {form.is_full_tank ? "Full Tank" : "Partial Tank"}
            </button>
          </div>
        </div>

        <Textarea
          label="Remarks"
          value={form.remarks}
          onChange={(value) =>
            setForm({
              ...form,
              remarks: value,
            })
          }
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
    <div className="rounded-lg border bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="mt-1 text-xl font-bold">{value}</h2>
    </div>
  );
}
