'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Wrench, Plus, Trash2, AlertTriangle, DollarSign } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchAndFilterBar from '@/components/common/SearchAndFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import FormDrawer from '@/components/forms/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import ResponsiveDataList from '@/components/tables/ResponsiveDataList';
import { getMaintenanceLogs, createMaintenanceLog, deleteMaintenanceLog } from '@/lib/api/maintenanceApi';
import { getVehicles } from '@/lib/api/vehicleApi';
import { maintenanceSchema, type MaintenanceFormValues } from '@/lib/validators';
import { formatDate, formatCurrency, daysUntil } from '@/lib/utils';
import type { MaintenanceLog } from '@/types';

function MaintenanceForm({ onSubmit }: { onSubmit: (v: MaintenanceFormValues) => void }) {
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });
  const { register, handleSubmit, formState: { errors } } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { status: 'SCHEDULED', maintenanceType: 'ROUTINE' },
  });
  return (
    <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <label className="form-label">Maintenance Date *</label>
          <input {...register('maintenanceDate')} type="date" className="form-input" />
          {errors.maintenanceDate && <p className="form-error">{errors.maintenanceDate.message}</p>}
        </div>
        <div>
          <label className="form-label">Next Service Date</label>
          <input {...register('nextServiceDate')} type="date" className="form-input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Type *</label>
          <select {...register('maintenanceType')} className="form-input appearance-none">
            {['ROUTINE','REPAIR','EMERGENCY','INSPECTION'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Status *</label>
          <select {...register('status')} className="form-input appearance-none">
            {['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'].map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Description *</label>
        <textarea {...register('description')} className="form-input resize-none" rows={3} placeholder="Describe the maintenance work…" />
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Cost (LKR) *</label>
          <input {...register('cost', { valueAsNumber: true })} type="number" step="0.01" className="form-input" placeholder="15000" />
          {errors.cost && <p className="form-error">{errors.cost.message}</p>}
        </div>
        <div>
          <label className="form-label">Technician</label>
          <input {...register('technician')} className="form-input" placeholder="Lanka Motors Service" />
        </div>
      </div>
    </form>
  );
}

export default function MaintenancePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: logs = [], isLoading } = useQuery({ queryKey: ['maintenance'], queryFn: () => getMaintenanceLogs() });

  const createMut = useMutation({
    mutationFn: createMaintenanceLog,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenance'] }); toast.success('Maintenance record added!'); setDrawerOpen(false); },
    onError: () => toast.error('Failed to add maintenance record'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteMaintenanceLog,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['maintenance'] }); toast.success('Record deleted'); setDeletingId(null); },
    onError: () => toast.error('Failed to delete record'),
  });

  const filtered = useMemo(() => logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.vehicle.registrationNumber.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchType = !filterType || l.maintenanceType === filterType;
    return matchSearch && matchStatus && matchType;
  }), [logs, search, filterStatus, filterType]);

  const totalCost = logs.reduce((s, l) => s + l.cost, 0);
  const upcoming = logs.filter((l) => l.status === 'SCHEDULED' && l.nextServiceDate && daysUntil(l.nextServiceDate) <= 14 && daysUntil(l.nextServiceDate) >= 0);

  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (l: MaintenanceLog) => <span className="font-mono text-blue-400 text-xs">{l.vehicle.registrationNumber}</span> },
    { key: 'date', header: 'Date', render: (l: MaintenanceLog) => <span className="text-xs">{formatDate(l.maintenanceDate)}</span> },
    { key: 'type', header: 'Type', render: (l: MaintenanceLog) => <span className="text-xs font-medium">{l.maintenanceType}</span> },
    { key: 'description', header: 'Description', render: (l: MaintenanceLog) => <span className="text-xs max-w-xs truncate block">{l.description}</span> },
    { key: 'cost', header: 'Cost', render: (l: MaintenanceLog) => <span className="font-semibold text-amber-400 text-sm">{formatCurrency(l.cost)}</span> },
    { key: 'nextService', header: 'Next Service', render: (l: MaintenanceLog) => <span className="text-xs">{l.nextServiceDate ? formatDate(l.nextServiceDate) : '—'}</span> },
    { key: 'status', header: 'Status', render: (l: MaintenanceLog) => <StatusBadge status={l.status} type="maintenance" /> },
    { key: 'actions', header: '', render: (l: MaintenanceLog) => (
      <button onClick={() => setDeletingId(l.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track vehicle maintenance schedules and costs"
        icon={Wrench}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Maintenance' }]}
        actions={<button className="btn-primary" onClick={() => setDrawerOpen(true)}><Plus size={15} /> Add Record</button>}
      />

      {/* Upcoming alerts */}
      {upcoming.length > 0 && (
        <div className="mb-4 p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400 mb-1">Upcoming Service Alerts</p>
            <ul className="space-y-0.5">
              {upcoming.map((l) => (
                <li key={l.id} className="text-xs text-slate-400">
                  {l.vehicle.registrationNumber} — next service on {formatDate(l.nextServiceDate!)} ({daysUntil(l.nextServiceDate!)} days)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card p-5 stat-accent-amber flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-amber-500/10"><DollarSign size={22} className="text-amber-400" /></div>
        <div><p className="text-2xl font-bold text-white">{formatCurrency(totalCost)}</p><p className="text-sm text-slate-400">Total Maintenance Cost</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <SearchAndFilterBar
            searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by vehicle or description…"
            filters={[
              { key: 'status', label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [{ label: 'Scheduled', value: 'SCHEDULED' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Completed', value: 'COMPLETED' }, { label: 'Cancelled', value: 'CANCELLED' }] },
              { key: 'type', label: 'Type', value: filterType, onChange: setFilterType, options: [{ label: 'Routine', value: 'ROUTINE' }, { label: 'Repair', value: 'REPAIR' }, { label: 'Emergency', value: 'EMERGENCY' }, { label: 'Inspection', value: 'INSPECTION' }] },
            ]}
          />
        </div>
        {isLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No maintenance records" icon={Wrench} action={<button className="btn-primary" onClick={() => setDrawerOpen(true)}><Plus size={14} /> Add Record</button>} />
        ) : (
          <ResponsiveDataList
            data={filtered} columns={columns} keyExtractor={(l) => l.id}
            renderMobileTitle={(l) => l.vehicle.registrationNumber}
            renderMobileSubtitle={(l) => `${l.maintenanceType} · ${formatDate(l.maintenanceDate)}`}
            renderMobileFields={(l) => [
              { label: 'Description', value: l.description, full: true },
              { label: 'Cost', value: formatCurrency(l.cost) },
              { label: 'Technician', value: l.technician || '—' },
              { label: 'Next Service', value: l.nextServiceDate ? formatDate(l.nextServiceDate) : '—' },
              { label: 'Status', value: <StatusBadge status={l.status} type="maintenance" /> },
            ]}
            renderMobileActions={(l) => <button onClick={() => setDeletingId(l.id)} className="btn-danger text-xs px-2 py-1"><Trash2 size={12} /></button>}
          />
        )}
      </div>

      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Maintenance Record"
        footer={<><button className="btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button><button form="maintenance-form" type="submit" className="btn-primary" disabled={createMut.isPending}>{createMut.isPending ? 'Saving…' : 'Add Record'}</button></>}
      >
        <MaintenanceForm onSubmit={(v) => createMut.mutate(v)} />
      </FormDrawer>

      <ConfirmDialog open={!!deletingId} title="Delete Record" message="This maintenance record will be permanently removed."
        confirmLabel="Delete" onConfirm={() => deletingId && deleteMut.mutate(deletingId)} onCancel={() => setDeletingId(null)} loading={deleteMut.isPending}
      />
    </div>
  );
}
