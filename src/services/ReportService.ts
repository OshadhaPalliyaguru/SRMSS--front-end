import apiClient from './apiClient';
import type { ApiResponse } from './types';
import type { ReportData } from '@/lib/api/reportApi';

export class ReportService {
  static async getMonthlyFuel(): Promise<ReportData> {
    const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/fuel-monthly');
    return data.data;
  }

  static async getMonthlyMaintenance(): Promise<ReportData> {
    const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/maintenance-monthly');
    return data.data;
  }

  static async getRoutePerformance(startDate: string, endDate: string): Promise<ReportData> {
    const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/route-performance', {
      params: { startDate, endDate },
    });
    return data.data;
  }

  static async getDriverPerformance(startDate: string, endDate: string): Promise<ReportData> {
    const { data } = await apiClient.get<ApiResponse<ReportData>>('/reports/driver-performance', {
      params: { startDate, endDate },
    });
    return data.data;
  }
}
