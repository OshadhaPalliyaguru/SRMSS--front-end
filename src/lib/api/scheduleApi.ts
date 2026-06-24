/**
 * scheduleApi.ts — thin adapter that delegates to ScheduleService.
 */
import { ScheduleService } from '@/services';
import type { Schedule, CreateSchedulePayload } from '@/types';

export const getSchedules = (params?: {
  status?: string;
  depotId?: number;
  driverId?: number;
  vehicleId?: number;
  scheduleDate?: string;
}): Promise<Schedule[]> => ScheduleService.getAll(params);

export const getTodaySchedules = (): Promise<Schedule[]> =>
  ScheduleService.getToday();

export const getScheduleById = (id: number): Promise<Schedule> =>
  ScheduleService.getById(id);

export const createSchedule = (payload: CreateSchedulePayload): Promise<Schedule> =>
  ScheduleService.create(payload);

export const updateSchedule = (id: number, payload: Partial<CreateSchedulePayload>): Promise<Schedule> =>
  ScheduleService.update(id, payload);

export const updateScheduleStatus = (id: number, status: string): Promise<Schedule> =>
  ScheduleService.updateStatus(id, status);

export const cancelSchedule = (id: number): Promise<void> =>
  ScheduleService.cancel(id);
