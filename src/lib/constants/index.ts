import {
  LayoutDashboard, Route, Calendar, Building2,
  Users, Bus, Fuel, Wrench, BarChart3, Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Routes',      href: '/routes',       icon: Route },
  { label: 'Schedules',   href: '/schedules',    icon: Calendar },
  { label: 'Depots',      href: '/depots',       icon: Building2 },
  { label: 'Drivers',     href: '/drivers',      icon: Users },
  { label: 'Vehicles',    href: '/vehicles',     icon: Bus },
  { label: 'Fuel Logs',   href: '/fuel-logs',    icon: Fuel },
  { label: 'Maintenance', href: '/maintenance',  icon: Wrench },
  { label: 'Reports',     href: '/reports',      icon: BarChart3 },
  { label: 'Settings',    href: '/settings',     icon: Settings },
];

// Mobile bottom nav (most-used items only)
export const MOBILE_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Routes',    href: '/routes',    icon: Route },
  { label: 'Schedules', href: '/schedules', icon: Calendar },
  { label: 'Vehicles',  href: '/vehicles',  icon: Bus },
  { label: 'More',      href: '/settings',  icon: Settings },
];

export const SCHEDULE_STATUS_COLORS: Record<string, string> = {
  ON_TIME:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  DELAYED:   'bg-amber-500/15   text-amber-400   border-amber-500/30',
  COMPLETED: 'bg-blue-500/15    text-blue-400    border-blue-500/30',
  CANCELLED: 'bg-red-500/15     text-red-400     border-red-500/30',
};

export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  AVAILABLE:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  ASSIGNED:    'bg-blue-500/15    text-blue-400    border-blue-500/30',
  MAINTENANCE: 'bg-amber-500/15   text-amber-400   border-amber-500/30',
  INACTIVE:    'bg-slate-500/15   text-slate-400   border-slate-500/30',
};

export const DRIVER_STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  AVAILABLE: 'bg-teal-500/15    text-teal-400    border-teal-500/30',
  INACTIVE:  'bg-slate-500/15   text-slate-400   border-slate-500/30',
  ON_LEAVE:  'bg-purple-500/15  text-purple-400  border-purple-500/30',
};

export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  SCHEDULED:   'bg-blue-500/15   text-blue-400   border-blue-500/30',
  IN_PROGRESS: 'bg-amber-500/15  text-amber-400  border-amber-500/30',
  COMPLETED:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CANCELLED:   'bg-red-500/15    text-red-400    border-red-500/30',
};

export const ROUTE_STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  INACTIVE:  'bg-slate-500/15   text-slate-400   border-slate-500/30',
  SUSPENDED: 'bg-red-500/15     text-red-400     border-red-500/30',
};
