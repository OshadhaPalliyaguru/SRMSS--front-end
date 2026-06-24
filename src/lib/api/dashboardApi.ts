/**
 * dashboardApi.ts — thin adapter that delegates to DashboardService.
 */
import { DashboardService } from '@/services';
import type { DashboardStats, ChartDataPoint, Alert } from '@/types';

export const getDashboardStats = (): Promise<DashboardStats> =>
  DashboardService.getStats();

export const getDashboardAlerts = (): Promise<Alert[]> =>
  DashboardService.getAlerts();

export const getRoutePerformanceChart = (): Promise<ChartDataPoint[]> =>
  DashboardService.getRoutePerformanceChart();

export const getFuelConsumptionChart = (): Promise<ChartDataPoint[]> =>
  DashboardService.getFuelConsumptionChart();

export const getScheduleStatusChart = (): Promise<ChartDataPoint[]> =>
  DashboardService.getScheduleStatusChart();
