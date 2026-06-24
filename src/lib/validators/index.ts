import { z } from 'zod';

// ─── Depot ───────────────────────────────────────────────

export const depotSchema = z.object({
  name: z.string().min(2, 'Depot name is required'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().min(5, 'Address is required'),
  contactNumber: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  managerName: z.string().min(2, 'Manager name is required'),
  capacity: z.number().int().positive('Capacity must be a positive number'),
});

export type DepotFormValues = z.infer<typeof depotSchema>;

// ─── Route ───────────────────────────────────────────────

export const routeSchema = z.object({
  routeCode: z.string().min(1, 'Route code is required'),
  routeName: z.string().min(2, 'Route name is required'),
  startPoint: z.string().min(2, 'Start point is required'),
  endPoint: z.string().min(2, 'End point is required'),
  totalDistance: z.number().positive('Distance must be > 0'),
  estimatedDuration: z.number().int().positive('Duration must be > 0 minutes'),
  depotId: z.number().int().positive('Please select a depot'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

export type RouteFormValues = z.infer<typeof routeSchema>;

// ─── Driver ──────────────────────────────────────────────

export const driverSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee number is required'),
  fullName: z.string().min(2, 'Full name is required'),
  nic: z.string().min(9, 'NIC must be at least 9 characters'),
  licenseNumber: z.string().min(4, 'License number is required'),
  licenseExpiryDate: z.string().min(1, 'Expiry date is required'),
  contactNumber: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  address: z.string().min(5, 'Address is required'),
  depotId: z.number().int().positive('Please select a depot'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'AVAILABLE', 'ON_LEAVE']),
});

export type DriverFormValues = z.infer<typeof driverSchema>;

// ─── Vehicle ─────────────────────────────────────────────

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  vehicleType: z.enum(['BUS', 'MINIBUS', 'COACH', 'ELECTRIC_BUS']),
  seatingCapacity: z.number().int().positive('Capacity must be a positive number'),
  mileage: z.number().nonnegative('Mileage must be >= 0'),
  depotId: z.number().int().positive('Please select a depot'),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'INACTIVE']),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1, 'Invalid year'),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

// ─── Schedule ────────────────────────────────────────────

export const scheduleSchema = z.object({
  scheduleCode: z.string().min(1, 'Schedule code is required'),
  routeId: z.number().int().positive('Please select a route'),
  vehicleId: z.number().int().positive('Please select a vehicle'),
  driverId: z.number().int().positive('Please select a driver'),
  depotId: z.number().int().positive('Please select a depot'),
  date: z.string().min(1, 'Date is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  recurrenceType: z.enum(['DAILY', 'WEEKLY', 'WEEKDAYS', 'WEEKENDS', 'NONE']),
  status: z.enum(['ON_TIME', 'DELAYED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// ─── Fuel Log ────────────────────────────────────────────

export const fuelLogSchema = z.object({
  vehicleId: z.number().int().positive('Please select a vehicle'),
  date: z.string().min(1, 'Date is required'),
  liters: z.number().positive('Liters must be > 0'),
  costPerLiter: z.number().positive('Cost must be > 0'),
  odometerReading: z.number().nonnegative('Odometer reading must be >= 0'),
  routeId: z.number().int().optional(),
  remarks: z.string().optional(),
});

export type FuelLogFormValues = z.infer<typeof fuelLogSchema>;

// ─── Maintenance ─────────────────────────────────────────

export const maintenanceSchema = z.object({
  vehicleId: z.number().int().positive('Please select a vehicle'),
  maintenanceDate: z.string().min(1, 'Maintenance date is required'),
  maintenanceType: z.enum(['ROUTINE', 'REPAIR', 'EMERGENCY', 'INSPECTION']),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  cost: z.number().nonnegative('Cost must be >= 0'),
  nextServiceDate: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  technician: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

// ─── Login ───────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
