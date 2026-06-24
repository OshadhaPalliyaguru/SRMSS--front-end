/**
 * maintenanceApi.ts — thin adapter that delegates to MaintenanceService.
 */
import { MaintenanceService } from '@/services';
import type { MaintenanceLog, CreateMaintenancePayload } from '@/types';

export const getMaintenanceLogs = (params?: { vehicleId?: number }): Promise<MaintenanceLog[]> =>
  MaintenanceService.getAll(params);

export const getMaintenanceLogById = (id: number): Promise<MaintenanceLog> =>
  MaintenanceService.getById(id);

export const getUpcomingMaintenance = (): Promise<MaintenanceLog[]> =>
  MaintenanceService.getUpcoming();

export const getPendingMaintenanceForVehicle = (vehicleId: number): Promise<MaintenanceLog[]> =>
  MaintenanceService.getPendingForVehicle(vehicleId);

export const createMaintenanceLog = (payload: CreateMaintenancePayload): Promise<MaintenanceLog> =>
  MaintenanceService.create(payload);

export const updateMaintenanceLog = (id: number, payload: Partial<CreateMaintenancePayload>): Promise<MaintenanceLog> =>
  MaintenanceService.update(id, payload);

export const deleteMaintenanceLog = (id: number): Promise<void> =>
  MaintenanceService.delete(id);
