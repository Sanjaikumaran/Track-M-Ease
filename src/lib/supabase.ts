import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

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

  async getAll(sortBy?: string[], sortOrder: "asc" | "desc" = "desc") {
    let query = supabase.from(this.tableName).select("*");

    if (sortBy?.length) {
      sortBy.forEach((field) => {
        query = query.order(field, {
          ascending: sortOrder === "asc",
        });
      });
    }

    return await query;
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
    };

    return await supabase
      .from(this.tableName)
      .insert(payload as T)
      .select()
      .single();
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
