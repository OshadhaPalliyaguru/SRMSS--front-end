import apiClient from './client';
import type { ApiResponse } from '@/types';

export interface ReportData {
  period: string;
  totalTrips: number;
  completedTrips: number;
  delayedTrips: number;
  cancelledTrips: number;
  totalFuelLiters: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  vehicleUtilizationRate: number;
  topRoutes: { routeName: string; trips: number }[];
}

export async function getMonthlyFuelReport(): Promise<ReportData> {
  const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/fuel-monthly');
  return data.data;
}

export async function getMonthlyMaintenanceReport(): Promise<ReportData> {
  const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/maintenance-monthly');
  return data.data;
}

export async function getRoutePerformanceReport(startDate: string, endDate: string): Promise<ReportData> {
  const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/route-performance', {
    params: { startDate, endDate },
  });
  return data.data;
}

export async function getDriverPerformanceReport(startDate: string, endDate: string): Promise<ReportData> {
  const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/driver-performance', {
    params: { startDate, endDate },
  });
  return data.data;
}

/** @deprecated Use getMonthlyFuelReport or getMonthlyMaintenanceReport instead */
export async function getWeeklyReport(): Promise<ReportData> {
  const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/fuel-monthly');
  return data.data;
}

/** @deprecated Use getMonthlyFuelReport or getMonthlyMaintenanceReport instead */
export async function getMonthlyReport(): Promise<ReportData> {
  const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/fuel-monthly');
  return data.data;
}
