import apiClient from './apiClient';
import type { ApiResponse, DriverDTO } from './types';
import type { Driver, CreateDriverPayload, Depot } from '@/types';

// ── Mapper ────────────────────────────────────────────────

function makeMinimalDepot(id: number, name: string): Depot {
  return {
    id,
    name,
    location: '',
    address: '',
    contactNumber: '',
    managerName: '',
    capacity: 0,
    activeRoutes: 0,
    activeBuses: 0,
    activeDrivers: 0,
    createdAt: '',
    updatedAt: '',
  };
}

function mapDriver(dto: DriverDTO): Driver {
  return {
    id: dto.id,
    employeeNumber: dto.employeeNumber,
    fullName: dto.fullName,
    nic: dto.nic,
    licenseNumber: dto.licenseNumber,
    licenseExpiryDate: dto.licenseExpiryDate,
    contactNumber: dto.contactNumber,
    address: dto.address,
    depot: makeMinimalDepot(dto.assignedDepotId, dto.depotName),
    status: dto.status as Driver['status'],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// ── Service Class ─────────────────────────────────────────

export class DriverService {
  private static readonly BASE = '/drivers';

  static async getAll(params?: {
    status?: string;
    depotId?: number;
    keyword?: string;
  }): Promise<Driver[]> {
    const { data } = await apiClient.get<ApiResponse<DriverDTO[]>>(this.BASE, { params });
    return (data.data ?? []).map(mapDriver);
  }

  static async getById(id: number): Promise<Driver> {
    const { data } = await apiClient.get<ApiResponse<DriverDTO>>(`${this.BASE}/${id}`);
    return mapDriver(data.data);
  }

  static async getExpiringLicenses(): Promise<Driver[]> {
    const { data } = await apiClient.get<ApiResponse<DriverDTO[]>>(`${this.BASE}/expiring-licenses`);
    return (data.data ?? []).map(mapDriver);
  }

  static async create(payload: CreateDriverPayload): Promise<Driver> {
    // Backend uses assignedDepotId
    const { data } = await apiClient.post<ApiResponse<DriverDTO>>(this.BASE, {
      ...payload,
      assignedDepotId: payload.depotId,
    });
    return mapDriver(data.data);
  }

  static async update(id: number, payload: Partial<CreateDriverPayload>): Promise<Driver> {
    const body = { ...payload } as Record<string, unknown>;
    if (payload.depotId) body.assignedDepotId = payload.depotId;
    const { data } = await apiClient.put<ApiResponse<DriverDTO>>(`${this.BASE}/${id}`, body);
    return mapDriver(data.data);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
}
