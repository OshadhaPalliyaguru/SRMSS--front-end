import apiClient from './apiClient';
import type { ApiResponse, MaintenanceLogDTO } from './types';
import type { MaintenanceLog, CreateMaintenancePayload, Vehicle, Depot } from '@/types';

// ── Helpers ───────────────────────────────────────────────

function minDepot(id: number, name: string): Depot {
  return { id, name, location: '', address: '', contactNumber: '', managerName: '', capacity: 0, activeRoutes: 0, activeBuses: 0, activeDrivers: 0, createdAt: '', updatedAt: '' };
}

function minVehicle(id: number, reg: string): Vehicle {
  return { id, registrationNumber: reg, vehicleType: 'BUS', seatingCapacity: 0, mileage: 0, depot: minDepot(0, ''), status: 'AVAILABLE', model: '', year: 0, createdAt: '', updatedAt: '' };
}

// ── Mapper ────────────────────────────────────────────────

function mapMaintenanceLog(dto: MaintenanceLogDTO): MaintenanceLog {
  return {
    id: dto.id,
    vehicle: minVehicle(dto.vehicleId, dto.vehicleNumber),
    maintenanceDate: dto.maintenanceDate,
    maintenanceType: dto.maintenanceType as MaintenanceLog['maintenanceType'],
    description: dto.description,
    cost: dto.cost,
    nextServiceDate: dto.nextServiceDate ?? undefined,
    status: dto.status as MaintenanceLog['status'],
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
  };
}

// ── Service Class ─────────────────────────────────────────

export class MaintenanceService {
  private static readonly BASE = '/maintenance-logs';

  static async getAll(params?: { vehicleId?: number }): Promise<MaintenanceLog[]> {
    const { data } = await apiClient.get<ApiResponse<MaintenanceLogDTO[]>>(this.BASE, { params });
    return (data.data ?? []).map(mapMaintenanceLog);
  }

  static async getById(id: number): Promise<MaintenanceLog> {
    const { data } = await apiClient.get<ApiResponse<MaintenanceLogDTO>>(`${this.BASE}/${id}`);
    return mapMaintenanceLog(data.data);
  }

  static async getUpcoming(): Promise<MaintenanceLog[]> {
    const { data } = await apiClient.get<ApiResponse<MaintenanceLogDTO[]>>(
      `${this.BASE}/upcoming`,
    );
    return (data.data ?? []).map(mapMaintenanceLog);
  }

  static async getPendingForVehicle(vehicleId: number): Promise<MaintenanceLog[]> {
    const { data } = await apiClient.get<ApiResponse<MaintenanceLogDTO[]>>(
      `${this.BASE}/vehicles/${vehicleId}/pending`,
    );
    return (data.data ?? []).map(mapMaintenanceLog);
  }

  static async create(payload: CreateMaintenancePayload): Promise<MaintenanceLog> {
    const { data } = await apiClient.post<ApiResponse<MaintenanceLogDTO>>(this.BASE, payload);
    return mapMaintenanceLog(data.data);
  }

  static async update(id: number, payload: Partial<CreateMaintenancePayload>): Promise<MaintenanceLog> {
    const { data } = await apiClient.put<ApiResponse<MaintenanceLogDTO>>(`${this.BASE}/${id}`, payload);
    return mapMaintenanceLog(data.data);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
}
