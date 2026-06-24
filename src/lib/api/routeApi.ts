/**
 * routeApi.ts — thin adapter that delegates to RouteService.
 */
import { RouteService } from '@/services';
import type { Route, RouteStop, CreateRoutePayload } from '@/types';

export const getRoutes = (params?: { depotId?: number; status?: string; startPoint?: string }): Promise<Route[]> =>
  RouteService.getAll(params);

export const getRouteById = (id: number): Promise<Route> =>
  RouteService.getById(id);

export const getRouteStops = (routeId: number): Promise<RouteStop[]> =>
  RouteService.getStops(routeId);

export const addRouteStop = (
  routeId: number,
  stop: { stopName: string; stopOrder: number; distanceFromStartKm: number; estimatedArrivalOffsetMinutes: number },
): Promise<RouteStop> => RouteService.addStop(routeId, stop);

export const deleteRouteStop = (routeId: number, stopId: number): Promise<void> =>
  RouteService.deleteStop(routeId, stopId);

export const createRoute = (payload: CreateRoutePayload): Promise<Route> =>
  RouteService.create(payload);

export const updateRoute = (id: number, payload: Partial<CreateRoutePayload>): Promise<Route> =>
  RouteService.update(id, payload);

export const deleteRoute = (id: number): Promise<void> =>
  RouteService.delete(id);
