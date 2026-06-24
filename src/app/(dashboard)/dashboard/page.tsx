'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Route, Bus, Users, Calendar, CheckCircle2, Clock, Gauge,
  Fuel, Wrench, AlertTriangle, LayoutDashboard,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import DashboardStatCard from '@/components/common/DashboardStatCard';
import ChartCard from '@/components/charts/ChartCard';
import PageHeader from '@/components/common/PageHeader';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import {
  getDashboardStats, getDashboardAlerts,
  getRoutePerformanceChart, getFuelConsumptionChart, getScheduleStatusChart,
} from '@/lib/api/dashboardApi';
import { getTodaySchedules } from '@/lib/api/scheduleApi';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Alert } from '@/types';

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

const ALERT_ICONS: Record<string, React.ElementType> = {
  LICENSE_EXPIRY: AlertTriangle,
  MAINTENANCE_DUE: Wrench,
  SCHEDULE_DELAY: Clock,
  VEHICLE_INACTIVE: Bus,
};

const ALERT_COLORS: Record<string, string> = {
  HIGH:   'border-red-500/25 bg-red-500/5',
  MEDIUM: 'border-amber-500/25 bg-amber-500/5',
  LOW:    'border-blue-500/25 bg-blue-500/5',
};
const ALERT_TEXT: Record<string, string> = {
  HIGH: 'text-red-400', MEDIUM: 'text-amber-400', LOW: 'text-blue-400',
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: getDashboardAlerts,
  });
  const { data: routeChart = [] } = useQuery({
    queryKey: ['route-performance-chart'],
    queryFn: getRoutePerformanceChart,
  });
  const { data: fuelChart = [] } = useQuery({
    queryKey: ['fuel-chart'],
    queryFn: getFuelConsumptionChart,
  });
  const { data: scheduleChart = [] } = useQuery({
    queryKey: ['schedule-chart'],
    queryFn: getScheduleStatusChart,
  });
  const { data: recentSchedules = [] } = useQuery({
    queryKey: ['today-schedules'],
    queryFn: getTodaySchedules,
    select: (data) => data.slice(0, 5),
  });

  const statCards = stats ? [
    { title: 'Total Routes',       value: stats.totalRoutes,              icon: Route,        accent: 'blue'    as const, description: 'All registered routes' },
    { title: 'Active Vehicles',    value: stats.activeVehicles,           icon: Bus,          accent: 'emerald' as const, description: 'Currently in service' },
    { title: 'Active Drivers',     value: stats.activeDrivers,            icon: Users,        accent: 'teal'    as const, description: 'On duty today' },
    { title: "Today's Schedules",  value: stats.todaySchedules,           icon: Calendar,     accent: 'purple'  as const, description: 'Scheduled for today' },
    { title: 'Completed Trips',    value: stats.completedTrips,           icon: CheckCircle2, accent: 'emerald' as const, description: 'Today so far' },
    { title: 'Delayed Trips',      value: stats.delayedTrips,             icon: Clock,        accent: 'amber'   as const, description: 'Currently delayed' },
    { title: 'Utilization Rate',   value: stats.vehicleUtilizationRate,   icon: Gauge,        accent: 'cyan'    as const, suffix: '%', description: 'Fleet utilization this month' },
    { title: 'Fuel Usage (Month)', value: stats.totalFuelUsageThisMonth,  icon: Fuel,         accent: 'orange'  as const, suffix: ' L', description: 'Total liters consumed' },
    { title: 'Maintenance Cost',   value: Math.round(stats.totalMaintenanceCostThisMonth / 1000), icon: Wrench, accent: 'rose' as const, prefix: 'LKR ', suffix: 'k', description: 'This month' },
  ] : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your fleet and operations"
        icon={LayoutDashboard}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
      />

      {/* Stat cards */}
      {statsLoading ? (
        <LoadingSkeleton variant="stat" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <DashboardStatCard key={card.title} {...card} index={i} />
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {/* Route performance */}
        <ChartCard
          title="Route Performance"
          description="Scheduled vs Completed trips this week"
          className="xl:col-span-1"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={routeChart} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              <Bar dataKey="value" name="Scheduled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="secondaryValue" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fuel consumption */}
        <ChartCard title="Fuel Consumption" description="Monthly liters consumed (Jan–Jun 2026)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={fuelChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="value" name="Liters" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Schedule status */}
        <ChartCard title="Schedule Status" description="Status breakdown this month">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={scheduleChart}
                dataKey="value"
                nameKey="label"
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3}
              >
                {scheduleChart.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom row: recent schedules + alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent schedules */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Recent Schedules</h3>
            <p className="text-xs text-slate-500 mt-0.5">Today's active and recent schedules</p>
          </div>
          <div className="divide-y divide-white/5">
            {recentSchedules.map((s, i) => (
              <motion.div
                key={s.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/2 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar size={14} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.scheduleCode} — {s.route.routeName}</p>
                  <p className="text-xs text-slate-500">{s.departureTime} → {s.arrivalTime} · {s.driver.fullName}</p>
                </div>
                <StatusBadge status={s.status} type="schedule" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Active Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Items requiring your attention</p>
          </div>
          {alertsLoading ? (
            <div className="p-4"><LoadingSkeleton variant="text" rows={5} /></div>
          ) : (
            <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
              {alerts.map((alert: Alert, i) => {
                const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle;
                return (
                  <motion.div
                    key={alert.id}
                    className={`flex items-start gap-3 px-4 py-3 border-l-2 ${ALERT_COLORS[alert.severity]}`}
                    style={{ borderLeftColor: alert.severity === 'HIGH' ? '#ef4444' : alert.severity === 'MEDIUM' ? '#f59e0b' : '#3b82f6' }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Icon size={15} className={`flex-shrink-0 mt-0.5 ${ALERT_TEXT[alert.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{alert.entityName}</p>
                    </div>
                    <span className={`text-xs font-semibold uppercase ${ALERT_TEXT[alert.severity]}`}>{alert.severity}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
