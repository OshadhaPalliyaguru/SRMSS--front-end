import apiClient from './apiClient';
import type { ApiResponse, DepotDTO } from './types';
import type { Depot, CreateDepotPayload } from '@/types';

// ── Mapper ────────────────────────────────────────────────

function mapDepot(dto: DepotDTO): Depot {
  return {
    id: dto.id,
    name: dto.name,
    location: dto.location,
    address: dto.location,           // backend has no separate address field
    contactNumber: dto.contactNumber,
    managerName: '',                 // not in current backend response
    capacity: 0,                     // not in current backend response
    activeRoutes: 0,
    activeBuses: 0,
    activeDrivers: 0,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// ── Service Class ─────────────────────────────────────────

export class DepotService {
  private static readonly BASE = '/depots';

  static async getAll(params?: { status?: string }): Promise<Depot[]> {
    const { data } = await apiClient.get<ApiResponse<DepotDTO[]>>(this.BASE, { params });
    return (data.data ?? []).map(mapDepot);
  }

  static async getById(id: number): Promise<Depot> {
    const { data } = await apiClient.get<ApiResponse<DepotDTO>>(`${this.BASE}/${id}`);
    return mapDepot(data.data);
  }

  static async create(payload: CreateDepotPayload): Promise<Depot> {
    const { data } = await apiClient.post<ApiResponse<DepotDTO>>(this.BASE, payload);
    return mapDepot(data.data);
  }

  static async update(id: number, payload: Partial<CreateDepotPayload>): Promise<Depot> {
    const { data } = await apiClient.put<ApiResponse<DepotDTO>>(`${this.BASE}/${id}`, payload);
    return mapDepot(data.data);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
}
