export interface PendingShipperRecord {
  key: string;
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  status: string;
  rawStatus: string;
}

export interface DashboardStats {
  totalPlatformRevenue: number;
  totalFoodGmv: number;
  totalShipGmv: number;
  totalOrders: number;
  totalShippers: number;
  totalUsers?: number;
  totalRestaurants?: number;
}
