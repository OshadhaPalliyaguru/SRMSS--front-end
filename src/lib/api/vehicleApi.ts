/**
 * vehicleApi.ts — thin adapter that delegates to VehicleService.
 */
import { VehicleService } from '@/services';
import type { Vehicle, CreateVehiclePayload } from '@/types';

export const getVehicles = (params?: { status?: string; depotId?: number; vehicleType?: string }): Promise<Vehicle[]> =>
  VehicleService.getAll(params);

export const getVehicleById = (id: number): Promise<Vehicle> =>
  VehicleService.getById(id);

export const createVehicle = (payload: CreateVehiclePayload): Promise<Vehicle> =>
  VehicleService.create(payload);

export const updateVehicle = (id: number, payload: Partial<CreateVehiclePayload>): Promise<Vehicle> =>
  VehicleService.update(id, payload);

export const updateVehicleMileage = (id: number, mileageKm: number): Promise<Vehicle> =>
  VehicleService.updateMileage(id, mileageKm);

export const deleteVehicle = (id: number): Promise<void> =>
  VehicleService.delete(id);
