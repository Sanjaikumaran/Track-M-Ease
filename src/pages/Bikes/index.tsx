import { useEffect, useRef, useState } from "react";
import SupabaseService from "../../lib/supabase";
import { useToast } from "../../context/toast";
import GenericFormModal from "../../components/form";
import { bikeFormConfig } from "./config";
import { formatDate } from "../../lib/helpers";

interface Bikes {
  id?: string;
  created_at?: string;
  brand: string;
  model: string;
  year: number;
  bike_number?: string;
  owner: string;
}

const initialForm: Bikes = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  bike_number: "",
  owner: "",
};

const initialErrors = {
  brand: "",
  model: "",
  year: "",
  bike_number: "",
  owner: "",
};

const bikeService = new SupabaseService<Bikes>("bikes");
const Bikes = () => {
  const toast = useToast();
  const fetchedRef = useRef(false);
  const [bikes, setBikes] = useState<Bikes[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBike, setEditingBike] = useState<Bikes | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);

  const fetchBikes = async (refresh: boolean = false) => {
    setLoading(true);
    try {
      const { data, error } = await bikeService.getAll(refresh);
      if (error) {
        toast.error(error.message);
        return;
      }
      setBikes(data || []);
    } catch (err: unknown) {
      toast.error(`${err || "Failed to fetch bikes"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchBikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (data: Bikes) => {
    const newErrors = {
      brand: "",
      model: "",
      year: "",
      bike_number: "",
      owner: "",
    };
    if (!data.brand) newErrors.brand = "Brand is required";
    if (!data.model) newErrors.model = "Model is required";
    if (
      Number(data.year || 0) < 2000 ||
      Number(data.year || 0) > new Date().getFullYear()
    )
      newErrors.year = "Invalid year";
    if (!data.bike_number) newErrors.bike_number = "Bike number is required";
    if (!data.owner) newErrors.owner = "Owner is required";
    if (!data.bike_number) newErrors.bike_number = "Bike number is required";
    if (!data.owner) newErrors.owner = "Owner is required";
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const saveBike = async (data: Bikes) => {
    if (!validateForm(data)) return false;
    const payload = {
      brand: data.brand,
      model: data.model,
      year: data.year,
      bike_number: data.bike_number,
      owner: data.owner,
    };
    try {
      let res;
      if (editingBike) res = await bikeService.update(editingBike.id!, payload);
      else res = await bikeService.create(payload);
      if (res.error) {
        toast.error(res.error.message);
        return false;
      }
      toast.success(`Bike ${editingBike ? "updated" : "created"} successfully`);
      setEditingBike(null);
      fetchBikes(true);
      return true;
    } catch (err: unknown) {
      toast.error(`${err || "Save failed"}`);
      return false;
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Bikes</h2>
            <p className="text-sm text-gray-500">List of bikes</p>
          </div>
          <div className="flex gap-2">
            <GenericFormModal
              config={bikeFormConfig}
              title={editingBike ? "Edit Bike" : "Add Bike"}
              initialData={initialForm}
              editingData={editingBike || undefined}
              errors={errors}
              onSubmit={saveBike}
              submitLabel={editingBike ? "Update" : "Save"}
              onClose={() => {
                setEditingBike(null);
                setErrors(initialErrors);
              }}
            />
          </div>
        </div>
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            Loading...
          </div>
        ) : bikes.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            No bikes found
          </div>
        ) : (
          <div className="sticky top-[88px] max-h-[calc(100vh-120px)] overflow-hidden gap-4 flex flex-col">
            {bikes.map((bike) => (
              <div
                key={bike.id}
                className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold capitalize text-gray-900">
                      {bike.brand}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Brand</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-600">
                      {bike.model}
                    </p>
                    <p className="text-xs text-gray-400">Model</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Created At</p>
                    <p className="font-medium text-gray-700">
                      {formatDate(bike.created_at) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Number</p>
                    <p className="font-medium capitalize text-gray-700">
                      {bike.bike_number || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Year</p>
                    <p className="font-medium capitalize text-gray-700">
                      {bike.year || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Owner</p>
                    <p className="font-medium text-gray-700">
                      {bike.owner || "--"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingBike(bike)}
                      className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:cursor-pointer hover:bg-blue-100"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Bikes;
