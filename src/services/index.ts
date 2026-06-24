// ── Service classes ───────────────────────────────────────
export { DepotService } from './DepotService';
export { DriverService } from './DriverService';
export { VehicleService } from './VehicleService';
export { RouteService } from './RouteService';
export { ScheduleService } from './ScheduleService';
export { FuelLogService } from './FuelLogService';
export { MaintenanceService } from './MaintenanceService';
export { DashboardService } from './DashboardService';
export { ReportService } from './ReportService';

// ── Shared API client ────────────────────────────────────
export { default as apiClient } from './apiClient';

// ── Backend DTO types ─────────────────────────────────────
export type * from './types';
