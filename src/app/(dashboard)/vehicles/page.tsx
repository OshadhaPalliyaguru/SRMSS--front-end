'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Bus, Plus, Pencil, Trash2, Gauge } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchAndFilterBar from '@/components/common/SearchAndFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import FormDrawer from '@/components/forms/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import ResponsiveDataList from '@/components/tables/ResponsiveDataList';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/api/vehicleApi';
import { getDepots } from '@/lib/api/depotApi';
import { vehicleSchema, type VehicleFormValues } from '@/lib/validators';
import { formatNumber } from '@/lib/utils';
import type { Vehicle } from '@/types';

function VehicleForm({ defaultValues, onSubmit }: { defaultValues?: Partial<VehicleFormValues>; onSubmit: (v: VehicleFormValues) => void }) {
  const { data: depots = [] } = useQuery({ queryKey: ['depots'], queryFn: () => getDepots() });
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { status: 'AVAILABLE', vehicleType: 'BUS', ...defaultValues },
  });
  return (
    <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Registration No. *</label>
          <input {...register('registrationNumber')} className="form-input" placeholder="NB-2341" />
          {errors.registrationNumber && <p className="form-error">{errors.registrationNumber.message}</p>}
        </div>
        <div>
          <label className="form-label">Vehicle Type *</label>
          <select {...register('vehicleType')} className="form-input appearance-none">
            {['BUS','MINIBUS','COACH','ELECTRIC_BUS'].map((t) => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Model *</label>
          <input {...register('model')} className="form-input" placeholder="Ashok Leyland Viking" />
          {errors.model && <p className="form-error">{errors.model.message}</p>}
        </div>
        <div>
          <label className="form-label">Year *</label>
          <input {...register('year', { valueAsNumber: true })} type="number" className="form-input" placeholder="2020" />
          {errors.year && <p className="form-error">{errors.year.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Seating Capacity *</label>
          <input {...register('seatingCapacity', { valueAsNumber: true })} type="number" className="form-input" placeholder="54" />
          {errors.seatingCapacity && <p className="form-error">{errors.seatingCapacity.message}</p>}
        </div>
        <div>
          <label className="form-label">Current Mileage (km) *</label>
          <input {...register('mileage', { valueAsNumber: true })} type="number" className="form-input" placeholder="98100" />
          {errors.mileage && <p className="form-error">{errors.mileage.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Depot *</label>
          <select {...register('depotId', { valueAsNumber: true })} className="form-input appearance-none">
            <option value="">Select depot…</option>
            {depots.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {errors.depotId && <p className="form-error">{errors.depotId.message}</p>}
        </div>
        <div>
          <label className="form-label">Status *</label>
          <select {...register('status')} className="form-input appearance-none">
            {['AVAILABLE','ASSIGNED','MAINTENANCE','INACTIVE'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </form>
  );
}

export default function VehiclesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: vehicles = [], isLoading } = useQuery({ queryKey: ['vehicles'], queryFn: () => getVehicles() });

  const createMut = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle added!'); setDrawerOpen(false); },
    onError: () => toast.error('Failed to add vehicle'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleFormValues }) => updateVehicle(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle updated!'); setDrawerOpen(false); setEditingVehicle(null); },
    onError: () => toast.error('Failed to update vehicle'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle removed'); setDeletingId(null); },
    onError: () => toast.error('Failed to remove vehicle'),
  });

  const filtered = useMemo(() => vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.registrationNumber.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
    const matchStatus = !filterStatus || v.status === filterStatus;
    const matchType = !filterType || v.vehicleType === filterType;
    return matchSearch && matchStatus && matchType;
  }), [vehicles, search, filterStatus, filterType]);

  function openAdd() { setEditingVehicle(null); setDrawerOpen(true); }
  function openEdit(v: Vehicle) { setEditingVehicle(v); setDrawerOpen(true); }
  function handleSubmit(v: VehicleFormValues) {
    if (editingVehicle) updateMut.mutate({ id: editingVehicle.id, data: v });
    else createMut.mutate(v);
  }

  const columns = [
    { key: 'reg', header: 'Reg. No.', render: (v: Vehicle) => <span className="font-mono font-semibold text-blue-400">{v.registrationNumber}</span> },
    { key: 'model', header: 'Model / Year', render: (v: Vehicle) => <div><p className="text-white text-sm">{v.model}</p><p className="text-xs text-slate-500">{v.year}</p></div> },
    { key: 'type', header: 'Type', render: (v: Vehicle) => <span className="text-xs">{v.vehicleType.replace('_',' ')}</span> },
    { key: 'capacity', header: 'Seats', render: (v: Vehicle) => <span>{v.seatingCapacity}</span> },
    { key: 'mileage', header: 'Mileage', render: (v: Vehicle) => <span className="flex items-center gap-1 text-xs"><Gauge size={11} />{formatNumber(v.mileage)} km</span> },
    { key: 'depot', header: 'Depot', render: (v: Vehicle) => <span className="text-xs">{v.depot.name}</span> },
    { key: 'status', header: 'Status', render: (v: Vehicle) => <StatusBadge status={v.status} type="vehicle" /> },
    { key: 'actions', header: '', render: (v: Vehicle) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => setDeletingId(v.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Vehicle Management"
        description="Manage fleet vehicles, status, and mileage"
        icon={Bus}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Vehicles' }]}
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Vehicle</button>}
      />

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <SearchAndFilterBar
            searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search vehicles…"
            filters={[
              { key: 'status', label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [{ label: 'Available', value: 'AVAILABLE' }, { label: 'Assigned', value: 'ASSIGNED' }, { label: 'Maintenance', value: 'MAINTENANCE' }, { label: 'Inactive', value: 'INACTIVE' }] },
              { key: 'type', label: 'Type', value: filterType, onChange: setFilterType, options: [{ label: 'Bus', value: 'BUS' }, { label: 'Minibus', value: 'MINIBUS' }, { label: 'Coach', value: 'COACH' }, { label: 'Electric Bus', value: 'ELECTRIC_BUS' }] },
            ]}
          />
        </div>
        {isLoading ? (
          <LoadingSkeleton variant="table" rows={7} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No vehicles found" icon={Bus} action={<button className="btn-primary" onClick={openAdd}><Plus size={14} /> Add Vehicle</button>} />
        ) : (
          <ResponsiveDataList
            data={filtered} columns={columns} keyExtractor={(v) => v.id}
            renderMobileTitle={(v) => v.registrationNumber}
            renderMobileSubtitle={(v) => `${v.model} · ${v.year}`}
            renderMobileFields={(v) => [
              { label: 'Type', value: v.vehicleType.replace('_', ' ') },
              { label: 'Seats', value: v.seatingCapacity },
              { label: 'Mileage', value: `${formatNumber(v.mileage)} km` },
              { label: 'Depot', value: v.depot.name },
              { label: 'Status', value: <StatusBadge status={v.status} type="vehicle" /> },
            ]}
            renderMobileActions={(v) => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(v)} className="btn-secondary text-xs px-2 py-1"><Pencil size={12} /></button>
                <button onClick={() => setDeletingId(v.id)} className="btn-danger text-xs px-2 py-1"><Trash2 size={12} /></button>
              </div>
            )}
          />
        )}
      </div>

      <FormDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingVehicle(null); }}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        footer={<><button className="btn-secondary" onClick={() => { setDrawerOpen(false); setEditingVehicle(null); }}>Cancel</button><button form="vehicle-form" type="submit" className="btn-primary">{editingVehicle ? 'Save Changes' : 'Add Vehicle'}</button></>}
      >
        <VehicleForm
          defaultValues={editingVehicle ? { registrationNumber: editingVehicle.registrationNumber, vehicleType: editingVehicle.vehicleType, model: editingVehicle.model, year: editingVehicle.year, seatingCapacity: editingVehicle.seatingCapacity, mileage: editingVehicle.mileage, depotId: editingVehicle.depot.id, status: editingVehicle.status } : undefined}
          onSubmit={handleSubmit}
        />
      </FormDrawer>

      <ConfirmDialog open={!!deletingId} title="Remove Vehicle" message="This vehicle record will be permanently deleted."
        confirmLabel="Remove Vehicle" onConfirm={() => deletingId && deleteMut.mutate(deletingId)} onCancel={() => setDeletingId(null)} loading={deleteMut.isPending}
      />
    </div>
  );
}
