import Dexie, { type Table } from "dexie";

class AppDatabase<T> extends Dexie {
  drafts!: Table<T & { id?: number; updatedAt: string }>;
  transactions!: Table<T & { id?: number; createdAt: string }>;
  fuels!: Table<T & { id?: number; createdAt: string }>;
  shifts!: Table<T & { id?: number; createdAt: string }>;
  rides!: Table<T & { id?: number; createdAt: string }>;

  constructor() {
    super("MyAppDatabase");
    this.version(1).stores({
      drafts: "++id, updatedAt",
      transactions: "++id, createdAt",
      fuels: "++id, createdAt",
      shifts: "++id, createdAt",
      rides: "++id, createdAt",
    });
  }

  async create(tableName: keyof AppDatabase<T>, data: T) {
    const table = this.table(tableName as string);
    return await table.add(data);
  }

  async bulkCreate(tableName: keyof AppDatabase<T>, data: T[]) {
    const table = this.table(tableName as string);
    return await table.bulkAdd(data);
  }

  async update(
    tableName: keyof AppDatabase<T>,
    id: number | string,
    data: Partial<T>,
  ) {
    const table = this.table(tableName as string);
    return await table.update(id, data);
  }

  async getById(tableName: keyof AppDatabase<T>, id: number | string) {
    const table = this.table(tableName as string);
    return await table.get(id);
  }

  async getAll(tableName: keyof AppDatabase<T>) {
    const table = this.table(tableName as string);
    return await table.toArray();
  }

  async remove(tableName: keyof AppDatabase<T>, id: number | string) {
    const table = this.table(tableName as string);
    return await table.delete(id);
  }

  async clear(tableName: keyof AppDatabase<T>) {
    const table = this.table(tableName as string);
    return await table.clear();
  }

  async count(tableName: keyof AppDatabase<T>) {
    const table = this.table(tableName as string);
    return await table.count();
  }

  async exists(tableName: keyof AppDatabase<T>, id: number | string) {
    const table = this.table(tableName as string);
    const item = await table.get(id);
    return !!item;
  }

  async filter(
    tableName: keyof AppDatabase<T>,
    callback: (item: T) => boolean,
  ) {
    const table = this.table(tableName as string);
    return await table.filter(callback).toArray();
  }

  async sortBy(tableName: keyof AppDatabase<T>, key: string) {
    const table = this.table(tableName as string);
    return await table.orderBy(key).toArray();
  }

  async clearDatabase() {
    const tables = this.tables;
    await Promise.all(tables.map((table) => table.clear()));
  }
}

export default new AppDatabase();
