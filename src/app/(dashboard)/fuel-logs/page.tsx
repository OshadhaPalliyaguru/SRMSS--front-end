'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Fuel, Plus, Pencil, Trash2, Droplets, DollarSign,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/common/PageHeader';
import SearchAndFilterBar from '@/components/common/SearchAndFilterBar';
import FormDrawer from '@/components/forms/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import ResponsiveDataList from '@/components/tables/ResponsiveDataList';
import ChartCard from '@/components/charts/ChartCard';
import { getFuelLogs, createFuelLog, deleteFuelLog } from '@/lib/api/fuelLogApi';
import { getVehicles } from '@/lib/api/vehicleApi';
import { getRoutes } from '@/lib/api/routeApi';
import { fuelLogSchema, type FuelLogFormValues } from '@/lib/validators';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils';
import type { FuelLog } from '@/types';

function FuelLogForm({ onSubmit }: { onSubmit: (v: FuelLogFormValues) => void }) {
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: () => getRoutes() });
  const { register, handleSubmit, formState: { errors } } = useForm<FuelLogFormValues>({
    resolver: zodResolver(fuelLogSchema),
  });
  return (
    <form id="fuel-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Vehicle *</label>
        <select {...register('vehicleId', { valueAsNumber: true })} className="form-input appearance-none">
          <option value="">Select vehicle…</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.model}</option>)}
        </select>
        {errors.vehicleId && <p className="form-error">{errors.vehicleId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Date *</label>
          <input {...register('date')} type="date" className="form-input" />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>
        <div>
          <label className="form-label">Odometer Reading (km) *</label>
          <input {...register('odometerReading', { valueAsNumber: true })} type="number" className="form-input" placeholder="145230" />
          {errors.odometerReading && <p className="form-error">{errors.odometerReading.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Liters *</label>
          <input {...register('liters', { valueAsNumber: true })} type="number" step="0.1" className="form-input" placeholder="120" />
          {errors.liters && <p className="form-error">{errors.liters.message}</p>}
        </div>
        <div>
          <label className="form-label">Cost per Liter (LKR) *</label>
          <input {...register('costPerLiter', { valueAsNumber: true })} type="number" step="0.01" className="form-input" placeholder="350" />
          {errors.costPerLiter && <p className="form-error">{errors.costPerLiter.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">Route (optional)</label>
        <select {...register('routeId', { valueAsNumber: true })} className="form-input appearance-none">
          <option value="">Select route…</option>
          {routes.map((r) => <option key={r.id} value={r.id}>{r.routeCode} — {r.routeName}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Remarks</label>
        <input {...register('remarks')} className="form-input" placeholder="Full tank, top-up, etc." />
      </div>
    </form>
  );
}

export default function FuelLogsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: logs = [], isLoading } = useQuery({ queryKey: ['fuel-logs'], queryFn: () => getFuelLogs() });

  const createMut = useMutation({
    mutationFn: createFuelLog,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fuel-logs'] }); toast.success('Fuel log added!'); setDrawerOpen(false); },
    onError: () => toast.error('Failed to add fuel log'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteFuelLog,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fuel-logs'] }); toast.success('Fuel log deleted'); setDeletingId(null); },
    onError: () => toast.error('Failed to delete fuel log'),
  });

  const filtered = useMemo(() => logs.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.vehicle.registrationNumber.toLowerCase().includes(q) || (l.route?.routeName.toLowerCase().includes(q) ?? false);
  }), [logs, search]);

  const totalLiters = logs.reduce((s, l) => s + l.liters, 0);
  const totalCost = logs.reduce((s, l) => s + l.totalCost, 0);

  // Build trend chart data from logs grouped by date
  const trendData = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((l) => { map[l.date] = (map[l.date] ?? 0) + l.liters; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, liters]) => ({ label: date.slice(5), liters }));
  }, [logs]);

  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (l: FuelLog) => <span className="font-mono text-blue-400 text-xs">{l.vehicle.registrationNumber}</span> },
    { key: 'date', header: 'Date', render: (l: FuelLog) => <span className="text-xs">{formatDate(l.date)}</span> },
    { key: 'liters', header: 'Liters', render: (l: FuelLog) => <span className="font-medium">{l.liters} L</span> },
    { key: 'costPerLiter', header: 'Rate (LKR)', render: (l: FuelLog) => <span className="text-xs">{l.costPerLiter}/L</span> },
    { key: 'totalCost', header: 'Total Cost', render: (l: FuelLog) => <span className="font-semibold text-emerald-400">{formatCurrency(l.totalCost)}</span> },
    { key: 'odometer', header: 'Odometer', render: (l: FuelLog) => <span className="text-xs">{formatNumber(l.odometerReading)} km</span> },
    { key: 'route', header: 'Route', render: (l: FuelLog) => <span className="text-xs">{l.route?.routeCode ?? '—'}</span> },
    { key: 'actions', header: '', render: (l: FuelLog) => (
      <button onClick={() => setDeletingId(l.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Fuel Logs"
        description="Track fuel consumption and costs across your fleet"
        icon={Fuel}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Fuel Logs' }]}
        actions={<button className="btn-primary" onClick={() => setDrawerOpen(true)}><Plus size={15} /> Add Fuel Log</button>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-5 stat-accent-blue flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10"><Droplets size={22} className="text-blue-400" /></div>
          <div><p className="text-2xl font-bold text-white">{formatNumber(Math.round(totalLiters))} L</p><p className="text-sm text-slate-400">Total Fuel Consumed</p></div>
        </div>
        <div className="card p-5 stat-accent-emerald flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10"><DollarSign size={22} className="text-emerald-400" /></div>
          <div><p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p><p className="text-sm text-slate-400">Total Fuel Cost</p></div>
        </div>
      </div>

      {/* Trend chart */}
      <ChartCard title="Fuel Usage Trend" description="Daily liters consumed" className="mb-6">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', fontSize: '11px' }} />
            <Line type="monotone" dataKey="liters" name="Liters" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <SearchAndFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by vehicle or route…" />
        </div>
        {isLoading ? (
          <LoadingSkeleton variant="table" rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No fuel logs" icon={Fuel} action={<button className="btn-primary" onClick={() => setDrawerOpen(true)}><Plus size={14} /> Add Log</button>} />
        ) : (
          <ResponsiveDataList
            data={filtered} columns={columns} keyExtractor={(l) => l.id}
            renderMobileTitle={(l) => l.vehicle.registrationNumber}
            renderMobileSubtitle={(l) => formatDate(l.date)}
            renderMobileFields={(l) => [
              { label: 'Liters', value: `${l.liters} L` },
              { label: 'Rate', value: `LKR ${l.costPerLiter}/L` },
              { label: 'Total Cost', value: formatCurrency(l.totalCost) },
              { label: 'Odometer', value: `${formatNumber(l.odometerReading)} km` },
              { label: 'Route', value: l.route?.routeCode ?? '—' },
              { label: 'Remarks', value: l.remarks || '—', full: true },
            ]}
            renderMobileActions={(l) => <button onClick={() => setDeletingId(l.id)} className="btn-danger text-xs px-2 py-1"><Trash2 size={12} /></button>}
          />
        )}
      </div>

      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Fuel Log"
        footer={<><button className="btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button><button form="fuel-form" type="submit" className="btn-primary" disabled={createMut.isPending}>{createMut.isPending ? 'Saving…' : 'Add Log'}</button></>}
      >
        <FuelLogForm onSubmit={(v) => createMut.mutate(v)} />
      </FormDrawer>

      <ConfirmDialog open={!!deletingId} title="Delete Fuel Log" message="This fuel log will be permanently removed."
        confirmLabel="Delete" onConfirm={() => deletingId && deleteMut.mutate(deletingId)} onCancel={() => setDeletingId(null)} loading={deleteMut.isPending}
      />
    </div>
  );
}
