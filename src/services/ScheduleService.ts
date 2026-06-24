import apiClient from './apiClient';
import type { ApiResponse, ScheduleDTO } from './types';
import type { Schedule, CreateSchedulePayload, Driver, Vehicle, Route, Depot } from '@/types';

// ── Helpers ───────────────────────────────────────────────

function minDepot(id: number, name: string): Depot {
  return { id, name, location: '', address: '', contactNumber: '', managerName: '', capacity: 0, activeRoutes: 0, activeBuses: 0, activeDrivers: 0, createdAt: '', updatedAt: '' };
}

function minDriver(id: number, name: string, depotId: number, depotName: string): Driver {
  return { id, employeeNumber: '', fullName: name, nic: '', licenseNumber: '', licenseExpiryDate: '', contactNumber: '', address: '', depot: minDepot(depotId, depotName), status: 'ACTIVE', createdAt: '', updatedAt: '' };
}

function minVehicle(id: number, reg: string, depotId: number, depotName: string): Vehicle {
  return { id, registrationNumber: reg, vehicleType: 'BUS', seatingCapacity: 0, mileage: 0, depot: minDepot(depotId, depotName), status: 'AVAILABLE', model: '', year: 0, createdAt: '', updatedAt: '' };
}

function minRoute(id: number, name: string, depotId: number, depotName: string): Route {
  return { id, routeCode: '', routeName: name, startPoint: '', endPoint: '', totalDistance: 0, estimatedDuration: 0, depot: minDepot(depotId, depotName), status: 'ACTIVE', stops: [], createdAt: '', updatedAt: '' };
}

// ── Mapper ────────────────────────────────────────────────

function mapSchedule(dto: ScheduleDTO): Schedule {
  return {
    id: dto.id,
    scheduleCode: dto.scheduleCode,
    route: minRoute(dto.routeId, dto.routeName, dto.depotId, dto.depotName),
    vehicle: minVehicle(dto.vehicleId, dto.vehicleNumber, dto.depotId, dto.depotName),
    driver: minDriver(dto.driverId, dto.driverName, dto.depotId, dto.depotName),
    depot: minDepot(dto.depotId, dto.depotName),
    date: dto.scheduleDate,             // scheduleDate → date
    departureTime: dto.departureTime.substring(0, 5), // "HH:mm:ss" → "HH:mm"
    arrivalTime: dto.arrivalTime.substring(0, 5),
    recurrenceType: dto.recurrenceType as Schedule['recurrenceType'],
    status: dto.status as Schedule['status'],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// ── Service Class ─────────────────────────────────────────

export class ScheduleService {
  private static readonly BASE = '/schedules';

  static async getAll(params?: {
    status?: string;
    depotId?: number;
    driverId?: number;
    vehicleId?: number;
    scheduleDate?: string;
  }): Promise<Schedule[]> {
    const { data } = await apiClient.get<ApiResponse<ScheduleDTO[]>>(this.BASE, { params });
    return (data.data ?? []).map(mapSchedule);
  }

  static async getToday(): Promise<Schedule[]> {
    const { data } = await apiClient.get<ApiResponse<ScheduleDTO[]>>(`${this.BASE}/today`);
    return (data.data ?? []).map(mapSchedule);
  }

  static async getById(id: number): Promise<Schedule> {
    const { data } = await apiClient.get<ApiResponse<ScheduleDTO>>(`${this.BASE}/${id}`);
    return mapSchedule(data.data);
  }

  static async create(payload: CreateSchedulePayload): Promise<Schedule> {
    // Backend uses scheduleDate
    const body = {
      scheduleCode: payload.scheduleCode,
      routeId: payload.routeId,
      vehicleId: payload.vehicleId,
      driverId: payload.driverId,
      depotId: payload.depotId,
      scheduleDate: payload.date,
      departureTime: payload.departureTime,
      arrivalTime: payload.arrivalTime,
      recurrenceType: payload.recurrenceType,
    };
    const { data } = await apiClient.post<ApiResponse<ScheduleDTO>>(this.BASE, body);
    return mapSchedule(data.data);
  }

  static async update(id: number, payload: Partial<CreateSchedulePayload>): Promise<Schedule> {
    const body: Record<string, unknown> = { ...payload };
    if (payload.date) { body.scheduleDate = payload.date; delete body.date; }
    const { data } = await apiClient.put<ApiResponse<ScheduleDTO>>(`${this.BASE}/${id}`, body);
    return mapSchedule(data.data);
  }

  static async updateStatus(id: number, status: string): Promise<Schedule> {
    const { data } = await apiClient.patch<ApiResponse<ScheduleDTO>>(
      `${this.BASE}/${id}/status`,
      { status },
    );
    return mapSchedule(data.data);
  }

  static async cancel(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
}
