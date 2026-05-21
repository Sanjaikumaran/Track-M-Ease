import { useEffect, useMemo, useRef, useState } from "react";
import SupabaseService from "../../lib/supabase";

import { useToast } from "../../context/toast";
import { useDeleteConfirmation } from "../../context/deleteEntry";

import GenericFilters from "../../components/filter";
import GenericFormModal from "../../components/form";
import SummaryCardsGrid from "../../components/summaryCard";
import List from "../../components/list";

import { fuelFilterConfig, fuelFormConfig, fuelSummaryConfig } from "./config";

type FuelEntry = {
  id?: string;
  created_at?: string;
  fuel_date: string;
  fuel_time: string | null;
  litres: number;
  amount: number;
  odometer_km: number | null;
  is_full_tank: boolean | null;
  remarks: string | null;
  user_id?: string | null;
  last_updated_at?: string | null;
};

type FilterState = {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  fullTankOnly: boolean;
};

const initialForm: FuelEntry = {
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

const initialErrors = {
  fuel_date: "",
  fuel_time: "",
  litres: "",
  odometer_km: "",
  amount: "",
};

export default function FuelPage() {
  const fuelService = new SupabaseService<FuelEntry>("fuel_entries");
  const toast = useToast();
  const { confirmDelete } = useDeleteConfirmation();

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingFuel, setEditingFuel] = useState<FuelEntry | null>(null);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilters);
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);

  const fetchedRef = useRef<boolean>(false);

  async function fetchFuels() {
    setLoading(true);

    try {
      const { data, error } = await fuelService.getAll(
        ["fuel_date", "fuel_time"],
        "asc",
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      setFuelEntries(data || []);
    } catch (err: unknown) {
      toast.error(`${err || "Failed to fetch fuel entries"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchFuels();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validateForm(data: FuelEntry) {
    const err = {
      fuel_date: "",
      fuel_time: "",
      litres: "",
      amount: "",
      odometer_km: "",
    };

    if (!data.fuel_date) err.fuel_date = "Fuel date is required";
    if (!data.fuel_time) err.fuel_time = "Fuel time is required";

    if (Number(data.litres) <= 0) err.litres = "Litres must be > 0";
    if (Number(data.amount) <= 0) err.amount = "Amount must be > 0";
    if (Number(data.odometer_km) <= 0) err.odometer_km = "KM must be > 0";

    const latest = fuelEntries[0];

    if (!editingFuel && latest?.odometer_km) {
      if (Number(data.odometer_km) <= Number(latest.odometer_km)) {
        err.odometer_km = "KM must be greater than previous entry";
      }
    }

    setErrors(err);
    return !Object.values(err).some(Boolean);
  }

  async function saveFuelEntry(data: FuelEntry) {
    if (!validateForm(data)) return false;
    console.log("Validated data:", data);
    const payload = {
      fuel_date: data.fuel_date,
      fuel_time: data.fuel_time,
      litres: data.litres,
      amount: data.amount,
      odometer_km: data.odometer_km,
      is_full_tank: data.is_full_tank,
      remarks: data.remarks,
    };

    try {
      let error;

      if (editingFuel) {
        const res = await fuelService.update(editingFuel.id!, payload);
        error = res.error;
      } else {
        const res = await fuelService.create(payload);
        error = res.error;
      }

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        `Fuel entry ${editingFuel ? "updated" : "added"} successfully`,
      );

      setEditingFuel(null);
      fetchFuels();
    } catch (err: unknown) {
      toast.error(`${err || "Save failed"}`);
    }
  }

  async function deleteFuel(id: string) {
    await confirmDelete({
      title: "Delete Fuel Entry",
      message: "Are you sure you want to delete this fuel entry?",
      confirmText: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        const { error } = await fuelService.delete(id);

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Fuel entry deleted");
        fetchFuels();
      },
    });
  }

  const filteredFuelEntries = useMemo(() => {
    return fuelEntries.filter((fuel) => {
      const start =
        !appliedFilters.startDate || fuel.fuel_date >= appliedFilters.startDate;

      const end =
        !appliedFilters.endDate || fuel.fuel_date <= appliedFilters.endDate;

      const amount =
        (!appliedFilters.minAmount ||
          fuel.amount >= Number(appliedFilters.minAmount)) &&
        (!appliedFilters.maxAmount ||
          fuel.amount <= Number(appliedFilters.maxAmount));

      const fullTank = !appliedFilters.fullTankOnly || fuel.is_full_tank;

      return start && end && amount && fullTank;
    });
  }, [fuelEntries, appliedFilters]);

  const fuelWithMileage = useMemo(() => {
    const sorted = [...filteredFuelEntries].sort(
      (a, b) =>
        new Date(`${a.fuel_date}T${a.fuel_time || "00:00"}`).getTime() -
        new Date(`${b.fuel_date}T${b.fuel_time || "00:00"}`).getTime(),
    );

    const result = sorted.map((entry, i) => {
      if (i === 0) {
        return {
          ...entry,
          travelled_km: null,
          mileage_per_litre: null,
        };
      }

      const prev = sorted[i - 1];

      const travelled = Number(entry.odometer_km) - Number(prev.odometer_km);

      const mileage = prev.litres > 0 ? travelled / Number(prev.litres) : null;

      return {
        ...entry,
        travelled_km: travelled > 0 ? travelled : null,
        mileage_per_litre: mileage && mileage > 0 ? mileage : null,
      };
    });

    return result.reverse();
  }, [filteredFuelEntries]);

  const summary = useMemo(() => {
    return fuelWithMileage.reduce(
      (acc, f) => {
        acc.totalFuelCost += Number(f.amount || 0);
        acc.totalLitres += Number(f.litres || 0);
        acc.totalEntries += 1;

        if (f.travelled_km) acc.totalTravelledKm += Number(f.travelled_km);

        if (f.mileage_per_litre) {
          acc.totalMileage += Number(f.mileage_per_litre);
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
  }, [fuelWithMileage]);

  const averageMileage =
    summary.mileageCount > 0 ? summary.totalMileage / summary.mileageCount : 0;

  return (
    <div className="space-y-4 p-4">
      {/* SUMMARY */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between ">
          <h2 className="text-xl font-bold ">Fuel Summary</h2>

          <div className="flex gap-2">
            <GenericFilters
              title="Fuel Filters"
              filters={appliedFilters}
              setFilters={setAppliedFilters}
              initialFilters={initialFilters}
              config={fuelFilterConfig}
            />

            <GenericFormModal
              config={fuelFormConfig}
              title={editingFuel ? "Edit Fuel Entry" : "Add Fuel Entry"}
              initialData={initialForm}
              editingData={editingFuel || undefined}
              errors={errors}
              onSubmit={saveFuelEntry}
              submitLabel={editingFuel ? "Update" : "Save"}
              onClose={() => {
                setEditingFuel(null);
                setErrors(initialErrors);
              }}
            />
          </div>
        </div>

        <SummaryCardsGrid
          loading={loading}
          config={fuelSummaryConfig}
          data={{
            totalFuelCost: summary.totalFuelCost,
            totalLitres: summary.totalLitres,
            totalTravelledKm: summary.totalTravelledKm,
            averageMileage,
          }}
          cols={4}
        />
      </div>

      <List header="Fuel History" items={fuelWithMileage} loading={loading}>
        {fuelWithMileage.map((fuel) => (
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
                  ₹{(Number(fuel.amount) / Number(fuel.litres)).toFixed(2)}
                  /L
                </p>

                <p className="text-xs text-gray-400">Price per litre</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Date</p>

                <p className="font-medium text-gray-700">{fuel.fuel_date}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Time</p>

                <p className="font-medium text-gray-700">{fuel.fuel_time}</p>
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
                  onClick={() => setEditingFuel(fuel)}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:cursor-pointer hover:bg-blue-100"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteFuel(fuel.id || "")}
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
      </List>
    </div>
  );
}
