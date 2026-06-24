/**
 * fuelLogApi.ts — thin adapter that delegates to FuelLogService.
 */
import { FuelLogService } from '@/services';
import type { FuelLog, CreateFuelLogPayload } from '@/types';

export const getFuelLogs = (params?: {
  vehicleId?: number;
  routeId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<FuelLog[]> => FuelLogService.getAll(params);

export const getFuelLogById = (id: number): Promise<FuelLog> =>
  FuelLogService.getById(id);

export const getWeeklyFuelSummary = () => FuelLogService.getWeeklySummary();

export const getMonthlyFuelSummary = () => FuelLogService.getMonthlySummary();

export const createFuelLog = (payload: CreateFuelLogPayload): Promise<FuelLog> =>
  FuelLogService.create(payload);

export const updateFuelLog = (id: number, payload: Partial<CreateFuelLogPayload>): Promise<FuelLog> =>
  FuelLogService.update(id, payload);

export const deleteFuelLog = (id: number): Promise<void> =>
  FuelLogService.delete(id);
