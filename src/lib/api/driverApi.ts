/**
 * driverApi.ts — thin adapter that delegates to DriverService.
 */
import { DriverService } from '@/services';
import type { Driver, CreateDriverPayload } from '@/types';

export const getDrivers = (params?: { status?: string; depotId?: number; keyword?: string }): Promise<Driver[]> =>
  DriverService.getAll(params);

export const getDriverById = (id: number): Promise<Driver> =>
  DriverService.getById(id);

export const getExpiringLicenses = (): Promise<Driver[]> =>
  DriverService.getExpiringLicenses();

export const createDriver = (payload: CreateDriverPayload): Promise<Driver> =>
  DriverService.create(payload);

export const updateDriver = (id: number, payload: Partial<CreateDriverPayload>): Promise<Driver> =>
  DriverService.update(id, payload);

export const deleteDriver = (id: number): Promise<void> =>
  DriverService.delete(id);
