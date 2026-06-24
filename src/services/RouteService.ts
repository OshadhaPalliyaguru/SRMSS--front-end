import apiClient from './apiClient';
import type { ApiResponse, RouteDTO, RouteStopDTO } from './types';
import type { Route, RouteStop, CreateRoutePayload, Depot } from '@/types';

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

function mapStop(dto: RouteStopDTO): RouteStop {
  return {
    id: dto.id,
    stopName: dto.stopName,
    stopOrder: dto.stopOrder,
    estimatedTime: String(dto.estimatedArrivalOffsetMinutes ?? 0),
  };
}

function mapRoute(dto: RouteDTO): Route {
  return {
    id: dto.id,
    routeCode: dto.routeCode,
    routeName: dto.routeName,
    startPoint: dto.startPoint,
    endPoint: dto.endPoint,
    totalDistance: dto.totalDistanceKm,           // totalDistanceKm → totalDistance
    estimatedDuration: dto.estimatedDurationMinutes, // estimatedDurationMinutes → estimatedDuration
    depot: makeMinimalDepot(dto.depotId, dto.depotName),
    status: dto.status as Route['status'],
    stops: (dto.stops ?? []).map(mapStop),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// ── Service Class ─────────────────────────────────────────

export class RouteService {
  private static readonly BASE = '/routes';

  static async getAll(params?: {
    depotId?: number;
    status?: string;
    startPoint?: string;
  }): Promise<Route[]> {
    const { data } = await apiClient.get<ApiResponse<RouteDTO[]>>(this.BASE, { params });
    return (data.data ?? []).map(mapRoute);
  }

  static async getById(id: number): Promise<Route> {
    const { data } = await apiClient.get<ApiResponse<RouteDTO>>(`${this.BASE}/${id}`);
    return mapRoute(data.data);
  }

  static async getStops(routeId: number): Promise<RouteStop[]> {
    const { data } = await apiClient.get<ApiResponse<RouteStopDTO[]>>(
      `${this.BASE}/${routeId}/stops`,
    );
    return (data.data ?? []).map(mapStop);
  }

  static async addStop(
    routeId: number,
    stop: {
      stopName: string;
      stopOrder: number;
      distanceFromStartKm: number;
      estimatedArrivalOffsetMinutes: number;
    },
  ): Promise<RouteStop> {
    const { data } = await apiClient.post<ApiResponse<RouteStopDTO>>(
      `${this.BASE}/${routeId}/stops`,
      stop,
    );
    return mapStop(data.data);
  }

  static async deleteStop(routeId: number, stopId: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${routeId}/stops/${stopId}`);
  }

  static async create(payload: CreateRoutePayload): Promise<Route> {
    // Backend uses totalDistanceKm and estimatedDurationMinutes
    const body = {
      routeCode: payload.routeCode,
      routeName: payload.routeName,
      startPoint: payload.startPoint,
      endPoint: payload.endPoint,
      totalDistanceKm: payload.totalDistance,
      estimatedDurationMinutes: payload.estimatedDuration,
      depotId: payload.depotId,
      status: payload.status,
    };
    const { data } = await apiClient.post<ApiResponse<RouteDTO>>(this.BASE, body);
    return mapRoute(data.data);
  }

  static async update(id: number, payload: Partial<CreateRoutePayload>): Promise<Route> {
    const body: Record<string, unknown> = {};
    if (payload.routeCode) body.routeCode = payload.routeCode;
    if (payload.routeName) body.routeName = payload.routeName;
    if (payload.startPoint) body.startPoint = payload.startPoint;
    if (payload.endPoint) body.endPoint = payload.endPoint;
    if (payload.totalDistance !== undefined) body.totalDistanceKm = payload.totalDistance;
    if (payload.estimatedDuration !== undefined) body.estimatedDurationMinutes = payload.estimatedDuration;
    if (payload.depotId !== undefined) body.depotId = payload.depotId;
    if (payload.status) body.status = payload.status;
    const { data } = await apiClient.put<ApiResponse<RouteDTO>>(`${this.BASE}/${id}`, body);
    return mapRoute(data.data);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
}
