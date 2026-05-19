export interface MoneyAnalytics {
  income: number;
  expense: number;
  loan: number;
  balance: number;
}

export interface FuelAnalytics {
  totalCost: number;
  totalLitres: number;
  avgMileage: number;
  costPerKm: number;
}

export interface DashboardAnalytics {
  money: MoneyAnalytics;
  fuel: FuelAnalytics;
}
