import apiClient from './apiClient';
import type { ApiResponse, DashboardDTO } from './types';
import type { DashboardStats, ChartDataPoint, Alert } from '@/types';

// ── Mapper ────────────────────────────────────────────────

function mapStats(dto: DashboardDTO): DashboardStats {
  return {
    totalRoutes: dto.totalRoutes,
    activeVehicles: dto.totalActiveVehicles,         // totalActiveVehicles → activeVehicles
    activeDrivers: dto.totalActiveDrivers,           // totalActiveDrivers → activeDrivers
    todaySchedules: dto.todaySchedulesCount,         // todaySchedulesCount → todaySchedules
    completedTrips: dto.completedTripsCount,         // completedTripsCount → completedTrips
    delayedTrips: dto.delayedSchedulesCount,         // delayedSchedulesCount → delayedTrips
    vehicleUtilizationRate: dto.vehicleUtilizationPercentage, // vehicleUtilizationPercentage → vehicleUtilizationRate
    totalFuelUsageThisMonth: 0,                      // not in dashboard endpoint; use reports
    totalMaintenanceCostThisMonth: dto.maintenanceCostThisMonth,
  };
}

// ── Service Class ─────────────────────────────────────────

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardDTO>>('/dashboard');
    return mapStats(data.data);
  }

  /**
   * The current backend /dashboard endpoint does not expose alerts or chart data.
   * These return empty arrays until backend endpoints are added.
   */
  static async getAlerts(): Promise<Alert[]> {
    try {
      const { data } = await apiClient.get<ApiResponse<Alert[]>>('/dashboard/alerts');
      return data.data ?? [];
    } catch {
      return []; // endpoint not yet implemented on backend
    }
  }

  static async getRoutePerformanceChart(): Promise<ChartDataPoint[]> {
    try {
      const { data } = await apiClient.get<ApiResponse<ChartDataPoint[]>>(
        '/dashboard/charts/route-performance',
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  }

  static async getFuelConsumptionChart(): Promise<ChartDataPoint[]> {
    try {
      const { data } = await apiClient.get<ApiResponse<ChartDataPoint[]>>(
        '/dashboard/charts/fuel-consumption',
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  }

  static async getScheduleStatusChart(): Promise<ChartDataPoint[]> {
    try {
      const { data } = await apiClient.get<ApiResponse<ChartDataPoint[]>>(
        '/dashboard/charts/schedule-status',
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  }
}
