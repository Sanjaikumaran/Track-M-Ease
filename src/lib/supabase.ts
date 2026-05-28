import { supabase } from "./supabase.config";

type BaseEntity = {
  id?: string;
  user_id?: string | null;
};

class SupabaseService<T extends BaseEntity> {
  private tableName: string;

  private cache: T[] = [];

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
    forceRefresh = false,
    sortBy?: string[],
    sortOrder: "asc" | "desc" = "desc",
    selectFields: string[] = [],
  ) {
    if (this.cache.length && !forceRefresh) {
      return {
        data: this.cache,
        error: null,
      };
    }

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

    this.cache = (response.data ?? []) as unknown as T[];

    return {
      data: this.cache,
      error: response.error,
    };
  }

  async getById(id: string) {
    if (this.cache.length) {
      const item = this.cache.find((x) => x.id === id);

      if (item) {
        return {
          data: item,
          error: null,
        };
      }
    }

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
      id: undefined,
    };

    const response = await supabase
      .from(this.tableName)
      .insert(payload as T)
      .select()
      .single();

    if (response.data) {
      this.cache.unshift(response.data as unknown as T);
    }

    return response;
  }

  async update(id: string, data: Partial<T>) {
    const response = await supabase
      .from(this.tableName)
      .update(data as T)
      .eq("id", id)
      .select()
      .single();

    if (response.data) {
      this.cache = this.cache.map((item) =>
        item.id === id ? (response.data as unknown as T) : item,
      );
    }

    return response;
  }

  async delete(id: string) {
    const response = await supabase.from(this.tableName).delete().eq("id", id);

    this.cache = this.cache.filter((item) => item.id !== id);

    return response;
  }

  clearCache() {
    this.cache = [];
  }
}

export default SupabaseService;
