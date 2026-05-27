import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

type BaseEntity = {
  id?: string;
  user_id?: string | null;
};

class SupabaseService<T extends BaseEntity> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getCurrentUserId() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id;
  }

  async getAll(
    sortBy?: string[],
    sortOrder: "asc" | "desc" = "desc",
    selectFields: string[] = [],
  ) {
    const fields = selectFields.length > 0 ? selectFields.join(",") : "*";

    let query = supabase.from(this.tableName).select(fields);

    if (sortBy?.length) {
      sortBy.forEach((field) => {
        query = query.order(field, {
          ascending: sortOrder === "asc",
        });
      });
    }

    const response = await query;

    return {
      data: (response.data || []) as unknown as T[],
      error: response.error,
    };
  }

  async getById(id: string) {
    return await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();
  }

  async create(data: Omit<T, "id">) {
    const userId = await this.getCurrentUserId();

    const payload = {
      ...data,
      user_id: userId,
      id: undefined, // Ensure id is not set, allowing Supabase to auto-generate it
    };
    console.log("Creating entry in", this.tableName, "with payload:", payload);
    return await supabase.from(this.tableName).insert(payload as T);
  }

  async update(id: string, data: Partial<T>) {
    return await supabase
      .from(this.tableName)
      .update(data as T)
      .eq("id", id)
      .select()
      .single();
  }

  async delete(id: string) {
    return await supabase.from(this.tableName).delete().eq("id", id);
  }
}

export default SupabaseService;
export { supabase };
