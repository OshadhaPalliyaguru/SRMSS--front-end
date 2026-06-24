// ============================================================
// SRMSS – Shared TypeScript Types
// ============================================================

/** Standard API response wrapper from the Spring Boot backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ──────────────────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────────────────

export type ScheduleStatus = 'ON_TIME' | 'DELAYED' | 'COMPLETED' | 'CANCELLED';
export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'INACTIVE';
export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'AVAILABLE' | 'ON_LEAVE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type RouteStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'WEEKDAYS' | 'WEEKENDS' | 'NONE';
export type MaintenanceType = 'ROUTINE' | 'REPAIR' | 'EMERGENCY' | 'INSPECTION';
export type VehicleType = 'BUS' | 'MINIBUS' | 'COACH' | 'ELECTRIC_BUS';
export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'DRIVER';

// ──────────────────────────────────────────────────────────
// Core Entities
// ──────────────────────────────────────────────────────────

export interface Depot {
  id: number;
  name: string;
  location: string;
  address: string;
  contactNumber: string;
  managerName: string;
  capacity: number;
  activeRoutes: number;
  activeBuses: number;
  activeDrivers: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  id: number;
  stopName: string;
  stopOrder: number;
  estimatedTime: string; // minutes from start
  lat?: number;          // for map rendering
  lng?: number;
}

export interface Route {
  id: number;
  routeCode: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  depot: Depot;
  status: RouteStatus;
  stops: RouteStop[];
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: number;
  employeeNumber: string;
  fullName: string;
  nic: string;
  licenseNumber: string;
  licenseExpiryDate: string; // ISO date
  contactNumber: string;
  address: string;
  depot: Depot;
  status: DriverStatus;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  registrationNumber: string;
  vehicleType: VehicleType;
  seatingCapacity: number;
  mileage: number; // km
  depot: Depot;
  status: VehicleStatus;
  model: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  scheduleCode: string;
  route: Route;
  vehicle: Vehicle;
  driver: Driver;
  depot: Depot;
  date: string; // ISO date
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  recurrenceType: RecurrenceType;
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: number;
  vehicle: Vehicle;
  date: string; // ISO date
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometerReading: number;
  route?: Route;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: number;
  vehicle: Vehicle;
  maintenanceDate: string; // ISO date
  maintenanceType: MaintenanceType;
  description: string;
  cost: number;
  nextServiceDate?: string;
  status: MaintenanceStatus;
  technician?: string;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRoutes: number;
  activeVehicles: number;
  activeDrivers: number;
  todaySchedules: number;
  completedTrips: number;
  delayedTrips: number;
  vehicleUtilizationRate: number; // percentage
  totalFuelUsageThisMonth: number; // liters
  totalMaintenanceCostThisMonth: number; // LKR
}

export interface Alert {
  id: number;
  type: 'LICENSE_EXPIRY' | 'MAINTENANCE_DUE' | 'SCHEDULE_DELAY' | 'VEHICLE_INACTIVE';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  entityId: number;
  entityName: string;
  createdAt: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

// ──────────────────────────────────────────────────────────
// Form Payloads (Create/Update)
// ──────────────────────────────────────────────────────────

export interface CreateDepotPayload {
  name: string;
  location: string;
  address: string;
  contactNumber: string;
  managerName: string;
  capacity: number;
}

export interface CreateRoutePayload {
  routeCode: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  totalDistance: number;
  estimatedDuration: number;
  depotId: number;
  status: RouteStatus;
}

export interface CreateDriverPayload {
  employeeNumber: string;
  fullName: string;
  nic: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  contactNumber: string;
  address: string;
  depotId: number;
  status: DriverStatus;
}

export interface CreateVehiclePayload {
  registrationNumber: string;
  vehicleType: VehicleType;
  seatingCapacity: number;
  mileage: number;
  depotId: number;
  status: VehicleStatus;
  model: string;
  year: number;
}

export interface CreateSchedulePayload {
  scheduleCode: string;
  routeId: number;
  vehicleId: number;
  driverId: number;
  depotId: number;
  date: string;
  departureTime: string;
  arrivalTime: string;
  recurrenceType: RecurrenceType;
  status: ScheduleStatus;
  notes?: string;
}

export interface CreateFuelLogPayload {
  vehicleId: number;
  date: string;
  liters: number;
  costPerLiter: number;
  odometerReading: number;
  routeId?: number;
  remarks?: string;
}

export interface CreateMaintenancePayload {
  vehicleId: number;
  maintenanceDate: string;
  maintenanceType: MaintenanceType;
  description: string;
  cost: number;
  nextServiceDate?: string;
  status: MaintenanceStatus;
  technician?: string;
}

// ──────────────────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
