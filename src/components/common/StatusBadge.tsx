import { cn } from '@/lib/utils';
import {
  SCHEDULE_STATUS_COLORS, VEHICLE_STATUS_COLORS,
  DRIVER_STATUS_COLORS, MAINTENANCE_STATUS_COLORS, ROUTE_STATUS_COLORS,
} from '@/lib/constants';

type StatusType = 'schedule' | 'vehicle' | 'driver' | 'maintenance' | 'route';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

const COLOR_MAP: Record<StatusType, Record<string, string>> = {
  schedule:    SCHEDULE_STATUS_COLORS,
  vehicle:     VEHICLE_STATUS_COLORS,
  driver:      DRIVER_STATUS_COLORS,
  maintenance: MAINTENANCE_STATUS_COLORS,
  route:       ROUTE_STATUS_COLORS,
};

const LABEL_MAP: Record<string, string> = {
  ON_TIME:     'On Time',
  DELAYED:     'Delayed',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
  AVAILABLE:   'Available',
  ASSIGNED:    'Assigned',
  MAINTENANCE: 'Maintenance',
  INACTIVE:    'Inactive',
  ACTIVE:      'Active',
  ON_LEAVE:    'On Leave',
  SCHEDULED:   'Scheduled',
  IN_PROGRESS: 'In Progress',
  SUSPENDED:   'Suspended',
};

export default function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const colorClass = COLOR_MAP[type]?.[status] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  const label = LABEL_MAP[status] ?? status;

  return (
    <span className={cn('badge', colorClass, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
