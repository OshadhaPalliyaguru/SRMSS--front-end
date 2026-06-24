'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchAndFilterBar from '@/components/common/SearchAndFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import FormDrawer from '@/components/forms/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import ResponsiveDataList from '@/components/tables/ResponsiveDataList';
import { getSchedules, createSchedule, cancelSchedule } from '@/lib/api/scheduleApi';
import { getRoutes } from '@/lib/api/routeApi';
import { getVehicles } from '@/lib/api/vehicleApi';
import { getDrivers } from '@/lib/api/driverApi';
import { getDepots } from '@/lib/api/depotApi';
import { scheduleSchema, type ScheduleFormValues } from '@/lib/validators';
import { formatDate } from '@/lib/utils';
import type { Schedule } from '@/types';

function ScheduleForm({ defaultValues, onSubmit }: { defaultValues?: Partial<ScheduleFormValues>; onSubmit: (v: ScheduleFormValues) => void }) {
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: () => getRoutes() });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => getDrivers() });
  const { data: depots = [] } = useQuery({ queryKey: ['depots'], queryFn: () => getDepots() });
  const { register, handleSubmit, formState: { errors } } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { status: 'ON_TIME', recurrenceType: 'NONE', ...defaultValues },
  });
  return (
    <form id="schedule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Schedule Code *</label>
          <input {...register('scheduleCode')} className="form-input" placeholder="SC-0001" />
          {errors.scheduleCode && <p className="form-error">{errors.scheduleCode.message}</p>}
        </div>
        <div>
          <label className="form-label">Date *</label>
          <input {...register('date')} type="date" className="form-input" />
          {errors.date && <p className="form-error">{errors.date.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">Route *</label>
        <select {...register('routeId', { valueAsNumber: true })} className="form-input appearance-none">
          <option value="">Select route…</option>
          {routes.map((r) => <option key={r.id} value={r.id}>{r.routeCode} — {r.routeName}</option>)}
        </select>
        {errors.routeId && <p className="form-error">{errors.routeId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Vehicle *</label>
          <select {...register('vehicleId', { valueAsNumber: true })} className="form-input appearance-none">
            <option value="">Select vehicle…</option>
            {vehicles.filter((v) => v.status === 'AVAILABLE' || v.status === 'ASSIGNED').map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
          </select>
          {errors.vehicleId && <p className="form-error">{errors.vehicleId.message}</p>}
        </div>
        <div>
          <label className="form-label">Driver *</label>
          <select {...register('driverId', { valueAsNumber: true })} className="form-input appearance-none">
            <option value="">Select driver…</option>
            {drivers.filter((d) => d.status !== 'INACTIVE').map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
          </select>
          {errors.driverId && <p className="form-error">{errors.driverId.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">Depot *</label>
        <select {...register('depotId', { valueAsNumber: true })} className="form-input appearance-none">
          <option value="">Select depot…</option>
          {depots.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {errors.depotId && <p className="form-error">{errors.depotId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Departure Time *</label>
          <input {...register('departureTime')} type="time" className="form-input" />
          {errors.departureTime && <p className="form-error">{errors.departureTime.message}</p>}
        </div>
        <div>
          <label className="form-label">Arrival Time *</label>
          <input {...register('arrivalTime')} type="time" className="form-input" />
          {errors.arrivalTime && <p className="form-error">{errors.arrivalTime.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Recurrence *</label>
          <select {...register('recurrenceType')} className="form-input appearance-none">
            {['NONE','DAILY','WEEKLY','WEEKDAYS','WEEKENDS'].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Status *</label>
          <select {...register('status')} className="form-input appearance-none">
            {['ON_TIME','DELAYED','COMPLETED','CANCELLED'].map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Notes</label>
        <textarea {...register('notes')} className="form-input resize-none" rows={3} placeholder="Optional notes…" />
      </div>
    </form>
  );
}

export default function SchedulesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const { data: schedules = [], isLoading } = useQuery({ queryKey: ['schedules'], queryFn: () => getSchedules() });

  const createMut = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule created!'); setDrawerOpen(false); },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? 'Failed to create schedule';
      if (msg.toLowerCase().includes('conflict')) {
        toast.error('Schedule Conflict', { description: msg });
      } else {
        toast.error(msg);
      }
    },
  });
  const cancelMut = useMutation({
    mutationFn: cancelSchedule,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schedules'] }); toast.success('Schedule cancelled'); setCancellingId(null); },
    onError: () => toast.error('Failed to cancel schedule'),
  });

  const filtered = useMemo(() => schedules.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.scheduleCode.toLowerCase().includes(q) || s.route.routeName.toLowerCase().includes(q) || s.driver.fullName.toLowerCase().includes(q);
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchDate = !filterDate || s.date === filterDate;
    return matchSearch && matchStatus && matchDate;
  }), [schedules, search, filterStatus, filterDate]);

  const columns = [
    { key: 'code', header: 'Code', render: (s: Schedule) => <span className="font-mono text-xs text-blue-400">{s.scheduleCode}</span> },
    { key: 'route', header: 'Route', render: (s: Schedule) => <span className="font-medium text-white text-sm">{s.route.routeName}</span> },
    { key: 'vehicle', header: 'Vehicle', render: (s: Schedule) => <span className="text-xs">{s.vehicle.registrationNumber}</span> },
    { key: 'driver', header: 'Driver', render: (s: Schedule) => <span className="text-xs">{s.driver.fullName}</span> },
    { key: 'date', header: 'Date', render: (s: Schedule) => <span className="text-xs">{formatDate(s.date)}</span> },
    { key: 'time', header: 'Time', render: (s: Schedule) => <span className="text-xs font-mono">{s.departureTime} → {s.arrivalTime}</span> },
    { key: 'recurrence', header: 'Recurrence', render: (s: Schedule) => <span className="text-xs">{s.recurrenceType}</span> },
    { key: 'status', header: 'Status', render: (s: Schedule) => <StatusBadge status={s.status} type="schedule" /> },
    { key: 'actions', header: '', render: (s: Schedule) => (
      <div className="flex items-center gap-1">
        {s.status !== 'CANCELLED' && s.status !== 'COMPLETED' && (
          <button onClick={() => setCancellingId(s.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Cancel"><Trash2 size={14} /></button>
        )}
        {s.notes && <span title={s.notes}><AlertCircle size={13} className="text-amber-400" /></span>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Schedule Management"
        description="Manage and monitor all transport schedules"
        icon={Calendar}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Schedules' }]}
        actions={<button className="btn-primary" onClick={() => setDrawerOpen(true)}><Plus size={15} /> Add Schedule</button>}
      />

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: 'On Time',   status: 'ON_TIME',   color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Delayed',   status: 'DELAYED',   color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Completed', status: 'COMPLETED', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'Cancelled', status: 'CANCELLED', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
        ].map((chip) => (
          <button
            key={chip.status}
            onClick={() => setFilterStatus(filterStatus === chip.status ? '' : chip.status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterStatus === chip.status ? chip.color : 'border-white/6 text-slate-500 hover:text-slate-300'}`}
          >
            {chip.label} ({schedules.filter((s) => s.status === chip.status).length})
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <SearchAndFilterBar
            searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search schedules, routes, drivers…"
            filters={[
              { key: 'status', label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [{ label: 'On Time', value: 'ON_TIME' }, { label: 'Delayed', value: 'DELAYED' }, { label: 'Completed', value: 'COMPLETED' }, { label: 'Cancelled', value: 'CANCELLED' }] },
            ]}
          />
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-slate-500">Filter by date:</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="form-input text-xs w-auto" />
            {filterDate && <button onClick={() => setFilterDate('')} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>}
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton variant="table" rows={7} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No schedules found" icon={Calendar} action={<button className="btn-primary" onClick={() => setDrawerOpen(true)}><Plus size={14} /> Add Schedule</button>} />
        ) : (
          <ResponsiveDataList
            data={filtered} columns={columns} keyExtractor={(s) => s.id}
            renderMobileTitle={(s) => s.route.routeName}
            renderMobileSubtitle={(s) => s.scheduleCode}
            renderMobileFields={(s) => [
              { label: 'Vehicle', value: s.vehicle.registrationNumber },
              { label: 'Driver', value: s.driver.fullName },
              { label: 'Date', value: formatDate(s.date) },
              { label: 'Time', value: `${s.departureTime} → ${s.arrivalTime}` },
              { label: 'Recurrence', value: s.recurrenceType },
              { label: 'Status', value: <StatusBadge status={s.status} type="schedule" /> },
            ]}
            renderMobileActions={(s) => s.status !== 'CANCELLED' && s.status !== 'COMPLETED' ? (
              <button onClick={() => setCancellingId(s.id)} className="btn-danger text-xs px-2 py-1"><Trash2 size={12} /> Cancel</button>
            ) : null}
          />
        )}
      </div>

      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title="Add New Schedule"
        description="Fill in the schedule details. The system will check for conflicts."
        footer={<><button className="btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button><button form="schedule-form" type="submit" className="btn-primary" disabled={createMut.isPending}>{createMut.isPending ? 'Creating…' : 'Create Schedule'}</button></>}
      >
        <ScheduleForm onSubmit={(v) => createMut.mutate(v)} />
      </FormDrawer>

      <ConfirmDialog open={!!cancellingId} title="Cancel Schedule" message="This schedule will be marked as CANCELLED. This action cannot be undone."
        confirmLabel="Cancel Schedule" dangerous onConfirm={() => cancellingId && cancelMut.mutate(cancellingId)} onCancel={() => setCancellingId(null)} loading={cancelMut.isPending}
      />
    </div>
  );
}
