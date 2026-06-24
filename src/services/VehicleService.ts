import apiClient from './apiClient';
import type { ApiResponse, VehicleDTO } from './types';
import type { Vehicle, CreateVehiclePayload, Depot } from '@/types';

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

function mapVehicle(dto: VehicleDTO): Vehicle {
  return {
    id: dto.id,
    registrationNumber: dto.registrationNumber,
    vehicleType: dto.vehicleType as Vehicle['vehicleType'],
    seatingCapacity: dto.seatingCapacity,
    mileage: dto.mileageKm,          // mileageKm → mileage
    depot: makeMinimalDepot(dto.assignedDepotId, dto.depotName),
    status: dto.status as Vehicle['status'],
    model: '',                        // not in current backend response
    year: 0,                          // not in current backend response
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// ── Service Class ─────────────────────────────────────────

export class VehicleService {
  private static readonly BASE = '/vehicles';

  static async getAll(params?: {
    status?: string;
    depotId?: number;
    vehicleType?: string;
  }): Promise<Vehicle[]> {
    const { data } = await apiClient.get<ApiResponse<VehicleDTO[]>>(this.BASE, { params });
    return (data.data ?? []).map(mapVehicle);
  }

  static async getById(id: number): Promise<Vehicle> {
    const { data } = await apiClient.get<ApiResponse<VehicleDTO>>(`${this.BASE}/${id}`);
    return mapVehicle(data.data);
  }

  static async create(payload: CreateVehiclePayload): Promise<Vehicle> {
    // Backend expects mileageKm and assignedDepotId
    const body = {
      registrationNumber: payload.registrationNumber,
      vehicleType: payload.vehicleType,
      seatingCapacity: payload.seatingCapacity,
      mileageKm: payload.mileage,
      assignedDepotId: payload.depotId,
      status: payload.status,
    };
    const { data } = await apiClient.post<ApiResponse<VehicleDTO>>(this.BASE, body);
    return mapVehicle(data.data);
  }

  static async update(id: number, payload: Partial<CreateVehiclePayload>): Promise<Vehicle> {
    const body: Record<string, unknown> = { ...payload };
    if (payload.mileage !== undefined) body.mileageKm = payload.mileage;
    if (payload.depotId !== undefined) body.assignedDepotId = payload.depotId;
    delete body.mileage;
    delete body.depotId;
    const { data } = await apiClient.put<ApiResponse<VehicleDTO>>(`${this.BASE}/${id}`, body);
    return mapVehicle(data.data);
  }

  static async updateMileage(id: number, mileageKm: number): Promise<Vehicle> {
    const { data } = await apiClient.patch<ApiResponse<VehicleDTO>>(
      `${this.BASE}/${id}/mileage`,
      { mileageKm },
    );
    return mapVehicle(data.data);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
}
