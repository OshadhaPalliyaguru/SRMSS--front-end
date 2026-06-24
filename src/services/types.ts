// ============================================================
// Backend DTO Types — exact shapes returned by Spring Boot API
// These are mapped → frontend types in each service class
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ── Depot ──────────────────────────────────────────────────
export interface DepotDTO {
  id: number;
  code: string;
  name: string;
  location: string;
  contactNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── Driver ─────────────────────────────────────────────────
export interface DriverDTO {
  id: number;
  employeeNumber: string;
  fullName: string;
  nic: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  licenseExpiringSoon: boolean;
  contactNumber: string;
  address: string;
  assignedDepotId: number;
  depotName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── Vehicle ────────────────────────────────────────────────
export interface VehicleDTO {
  id: number;
  registrationNumber: string;
  vehicleType: string;
  seatingCapacity: number;
  mileageKm: number;           // backend uses mileageKm
  assignedDepotId: number;
  depotName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── Route ──────────────────────────────────────────────────
export interface RouteDTO {
  id: number;
  routeCode: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  totalDistanceKm: number;         // backend uses totalDistanceKm
  estimatedDurationMinutes: number; // backend uses estimatedDurationMinutes
  depotId: number;
  depotName: string;
  status: string;
  stops: RouteStopDTO[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStopDTO {
  id: number;
  stopName: string;
  stopOrder: number;
  distanceFromStartKm: number;
  estimatedArrivalOffsetMinutes: number;
}

// ── Schedule ───────────────────────────────────────────────
export interface ScheduleDTO {
  id: number;
  scheduleCode: string;
  routeId: number;
  routeName: string;
  vehicleId: number;
  vehicleNumber: string;
  driverId: number;
  driverName: string;
  depotId: number;
  depotName: string;
  scheduleDate: string;          // backend uses scheduleDate
  departureTime: string;
  arrivalTime: string;
  recurrenceType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── Fuel Log ───────────────────────────────────────────────
export interface FuelLogDTO {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  logDate: string;              // backend uses logDate
  fuelLiters: number;           // backend uses fuelLiters
  fuelCost: number;             // backend uses fuelCost (total)
  odometerReadingKm: number;
  routeId: number | null;
  routeName: string | null;
  remarks: string | null;
  createdAt: string;
}

// ── Maintenance Log ────────────────────────────────────────
export interface MaintenanceLogDTO {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  maintenanceDate: string;
  maintenanceType: string;
  description: string;
  cost: number;
  nextServiceDate: string | null;
  status: string;
  createdAt: string;
}

// ── Dashboard ──────────────────────────────────────────────
export interface DashboardDTO {
  totalDepots: number;
  totalRoutes: number;
  totalActiveVehicles: number;
  totalActiveDrivers: number;
  vehiclesOnMaintenance: number;
  todaySchedulesCount: number;
  completedTripsCount: number;
  delayedSchedulesCount: number;
  totalVehicles: number;
  vehicleUtilizationPercentage: number;
  fuelCostThisMonth: number;
  maintenanceCostThisMonth: number;
}
