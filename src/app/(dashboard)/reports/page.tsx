'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BarChart3, Download, Calendar, TrendingUp, Fuel,
  Wrench, Gauge, Route, CheckCircle2, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import PageHeader from '@/components/common/PageHeader';
import ChartCard from '@/components/charts/ChartCard';
import { getMonthlyReport, getWeeklyReport } from '@/lib/api/reportApi';
import { formatCurrency, formatNumber } from '@/lib/utils';

const PERIOD_OPTIONS = [
  { label: 'Weekly',  value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export default function ReportsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', period],
    queryFn: period === 'weekly' ? getWeeklyReport : getMonthlyReport,
  });

  function handleExport() {
    toast.info('PDF Export', { description: 'PDF generation will be available once the backend endpoint is ready.' });
  }

  const tripData = report ? [
    { label: 'Completed', value: report.completedTrips },
    { label: 'Delayed',   value: report.delayedTrips },
    { label: 'Cancelled', value: report.cancelledTrips },
  ] : [];

  const routePerformance = report?.topRoutes ?? [];

  const summaryCards = report ? [
    { title: 'Total Trips',       value: report.totalTrips,              icon: Route,        color: 'text-blue-400',    bg: 'bg-blue-500/10' },
    { title: 'Completed',         value: report.completedTrips,          icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Delayed',           value: report.delayedTrips,            icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10' },
    { title: 'Utilization Rate',  value: `${report.vehicleUtilizationRate}%`, icon: Gauge, color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
    { title: 'Fuel Liters',       value: `${formatNumber(report.totalFuelLiters)} L`, icon: Fuel, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { title: 'Fuel Cost',         value: formatCurrency(report.totalFuelCost), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Maintenance Cost',  value: formatCurrency(report.totalMaintenanceCost), icon: Wrench, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ] : [];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Comprehensive performance and operational reports"
        icon={BarChart3}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
        actions={
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex rounded-lg bg-white/4 border border-white/6 p-0.5 gap-0.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value as 'weekly' | 'monthly')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === opt.value ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="btn-secondary text-xs" onClick={handleExport}>
              <Download size={13} /> Export PDF
            </button>
          </div>
        }
      />

      {/* Period label */}
      {report && (
        <motion.div
          key={period}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-5"
        >
          <Calendar size={14} className="text-slate-500" />
          <p className="text-xs text-slate-500">Showing data for: <span className="text-slate-300 font-medium">{report.period}</span></p>
        </motion.div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="card p-4 animate-shimmer h-24" />
          ))
        ) : (
          summaryCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className="card p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon size={15} className={card.color} />
                </div>
                <p className="text-base font-bold text-white">{card.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.title}</p>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Trip status breakdown */}
        <ChartCard title="Trip Status Breakdown" description="Completed vs Delayed vs Cancelled" isLoading={isLoading} isEmpty={tripData.length === 0}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={tripData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {tripData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top routes */}
        <ChartCard title="Top Routes by Trips" description="Most-served routes this period" isLoading={isLoading} isEmpty={routePerformance.length === 0}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={routePerformance} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="routeName" type="category" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={130} />
              <Tooltip contentStyle={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Bar dataKey="trips" name="Trips" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Cost comparison */}
      {report && (
        <ChartCard title="Cost Summary" description="Fuel vs Maintenance costs breakdown">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {[
              { label: 'Fuel Cost', value: report.totalFuelCost, color: 'bg-orange-500', pct: Math.round(report.totalFuelCost / (report.totalFuelCost + report.totalMaintenanceCost) * 100) },
              { label: 'Maintenance Cost', value: report.totalMaintenanceCost, color: 'bg-rose-500', pct: Math.round(report.totalMaintenanceCost / (report.totalFuelCost + report.totalMaintenanceCost) * 100) },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white font-semibold">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${item.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-slate-500">{item.pct}% of total cost</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
