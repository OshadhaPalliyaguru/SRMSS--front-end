import apiClient from './apiClient';
import type { ApiResponse, FuelLogDTO } from './types';
import type { FuelLog, CreateFuelLogPayload, Vehicle, Route, Depot } from '@/types';

// ── Helpers ───────────────────────────────────────────────

function minDepot(id: number, name: string): Depot {
  return { id, name, location: '', address: '', contactNumber: '', managerName: '', capacity: 0, activeRoutes: 0, activeBuses: 0, activeDrivers: 0, createdAt: '', updatedAt: '' };
}

function minVehicle(id: number, reg: string): Vehicle {
  return { id, registrationNumber: reg, vehicleType: 'BUS', seatingCapacity: 0, mileage: 0, depot: minDepot(0, ''), status: 'AVAILABLE', model: '', year: 0, createdAt: '', updatedAt: '' };
}

function minRoute(id: number, name: string): Route {
  return { id, routeCode: '', routeName: name, startPoint: '', endPoint: '', totalDistance: 0, estimatedDuration: 0, depot: minDepot(0, ''), status: 'ACTIVE', stops: [], createdAt: '', updatedAt: '' };
}

// ── Mapper ────────────────────────────────────────────────

function mapFuelLog(dto: FuelLogDTO): FuelLog {
  return {
    id: dto.id,
    vehicle: minVehicle(dto.vehicleId, dto.vehicleNumber),
    date: dto.logDate,                // logDate → date
    liters: dto.fuelLiters,           // fuelLiters → liters
    costPerLiter: dto.fuelCost > 0 && dto.fuelLiters > 0
      ? dto.fuelCost / dto.fuelLiters : 0,
    totalCost: dto.fuelCost,          // fuelCost is the total cost
    odometerReading: dto.odometerReadingKm,
    route: dto.routeId ? minRoute(dto.routeId, dto.routeName ?? '') : undefined,
    remarks: dto.remarks ?? '',
    createdAt: dto.createdAt,
    updatedAt: dto.createdAt,
  };
}

// ── Service Class ─────────────────────────────────────────

export class FuelLogService {
  private static readonly BASE = '/fuel-logs';

  static async getAll(params?: {
    vehicleId?: number;
    routeId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<FuelLog[]> {
    const { data } = await apiClient.get<ApiResponse<FuelLogDTO[]>>(this.BASE, { params });
    return (data.data ?? []).map(mapFuelLog);
  }

  static async getById(id: number): Promise<FuelLog> {
    const { data } = await apiClient.get<ApiResponse<FuelLogDTO>>(`${this.BASE}/${id}`);
    return mapFuelLog(data.data);
  }

  static async getWeeklySummary() {
    const { data } = await apiClient.get(`${this.BASE}/summary/weekly`);
    return data.data;
  }

  static async getMonthlySummary() {
    const { data } = await apiClient.get(`${this.BASE}/summary/monthly`);
    return data.data;
  }

  static async create(payload: CreateFuelLogPayload): Promise<FuelLog> {
    // Backend uses logDate, fuelLiters, fuelCost, odometerReadingKm
    const body = {
      vehicleId: payload.vehicleId,
      logDate: payload.date,
      fuelLiters: payload.liters,
      fuelCost: payload.costPerLiter && payload.liters
        ? payload.costPerLiter * payload.liters
        : payload.liters * 200,   // fallback estimate
      odometerReadingKm: payload.odometerReading,
      routeId: payload.routeId,
      remarks: payload.remarks,
    };
    const { data } = await apiClient.post<ApiResponse<FuelLogDTO>>(this.BASE, body);
    return mapFuelLog(data.data);
  }

  static async update(id: number, payload: Partial<CreateFuelLogPayload>): Promise<FuelLog> {
    const body: Record<string, unknown> = {};
    if (payload.vehicleId) body.vehicleId = payload.vehicleId;
    if (payload.date) body.logDate = payload.date;
    if (payload.liters !== undefined) body.fuelLiters = payload.liters;
    if (payload.odometerReading !== undefined) body.odometerReadingKm = payload.odometerReading;
    if (payload.routeId !== undefined) body.routeId = payload.routeId;
    if (payload.remarks !== undefined) body.remarks = payload.remarks;
    const { data } = await apiClient.put<ApiResponse<FuelLogDTO>>(`${this.BASE}/${id}`, body);
    return mapFuelLog(data.data);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
}
