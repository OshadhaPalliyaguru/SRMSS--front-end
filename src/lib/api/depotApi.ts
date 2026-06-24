/**
 * depotApi.ts — thin adapter that delegates to DepotService.
 * Pages import from here; the actual HTTP logic lives in @/services/DepotService.
 */
import { DepotService } from '@/services';
import type { Depot, CreateDepotPayload } from '@/types';

export const getDepots = (params?: { status?: string }): Promise<Depot[]> =>
  DepotService.getAll(params);

export const getDepotById = (id: number): Promise<Depot> =>
  DepotService.getById(id);

export const createDepot = (payload: CreateDepotPayload): Promise<Depot> =>
  DepotService.create(payload);

export const updateDepot = (id: number, payload: Partial<CreateDepotPayload>): Promise<Depot> =>
  DepotService.update(id, payload);

export const deleteDepot = (id: number): Promise<void> =>
  DepotService.delete(id);
