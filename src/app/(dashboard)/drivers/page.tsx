'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Users, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchAndFilterBar from '@/components/common/SearchAndFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import FormDrawer from '@/components/forms/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import ResponsiveDataList from '@/components/tables/ResponsiveDataList';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '@/lib/api/driverApi';
import { getDepots } from '@/lib/api/depotApi';
import { driverSchema, type DriverFormValues } from '@/lib/validators';
import { formatDate, isExpiringSoon, isExpired, daysUntil } from '@/lib/utils';
import type { Driver } from '@/types';

function DriverForm({ defaultValues, onSubmit }: { defaultValues?: Partial<DriverFormValues>; onSubmit: (v: DriverFormValues) => void }) {
  const { data: depots = [] } = useQuery({ queryKey: ['depots'], queryFn: () => getDepots() });
  const { register, handleSubmit, formState: { errors } } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: { status: 'ACTIVE', ...defaultValues },
  });
  return (
    <form id="driver-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Employee No. *</label>
          <input {...register('employeeNumber')} className="form-input" placeholder="EMP-001" />
          {errors.employeeNumber && <p className="form-error">{errors.employeeNumber.message}</p>}
        </div>
        <div>
          <label className="form-label">Status *</label>
          <select {...register('status')} className="form-input appearance-none">
            {['ACTIVE','INACTIVE','AVAILABLE','ON_LEAVE'].map((s) => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Full Name *</label>
        <input {...register('fullName')} className="form-input" placeholder="Kamal Perera" />
        {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">NIC *</label>
          <input {...register('nic')} className="form-input" placeholder="850123456V" />
          {errors.nic && <p className="form-error">{errors.nic.message}</p>}
        </div>
        <div>
          <label className="form-label">Contact Number *</label>
          <input {...register('contactNumber')} className="form-input" placeholder="0771234567" />
          {errors.contactNumber && <p className="form-error">{errors.contactNumber.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">License Number *</label>
          <input {...register('licenseNumber')} className="form-input" placeholder="LIC-2341" />
          {errors.licenseNumber && <p className="form-error">{errors.licenseNumber.message}</p>}
        </div>
        <div>
          <label className="form-label">License Expiry Date *</label>
          <input {...register('licenseExpiryDate')} type="date" className="form-input" />
          {errors.licenseExpiryDate && <p className="form-error">{errors.licenseExpiryDate.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">Address *</label>
        <input {...register('address')} className="form-input" placeholder="12 Galle Rd, Colombo 03" />
        {errors.address && <p className="form-error">{errors.address.message}</p>}
      </div>
      <div>
        <label className="form-label">Depot *</label>
        <select {...register('depotId', { valueAsNumber: true })} className="form-input appearance-none">
          <option value="">Select depot…</option>
          {depots.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {errors.depotId && <p className="form-error">{errors.depotId.message}</p>}
      </div>
    </form>
  );
}

function LicenseWarning({ date }: { date: string }) {
  const expired = isExpired(date);
  const expiring = isExpiringSoon(date);
  const days = daysUntil(date);
  if (!expired && !expiring) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${expired ? 'text-red-400' : 'text-amber-400'}`}>
      <AlertTriangle size={11} />
      {expired ? 'Expired' : `${days}d left`}
    </span>
  );
}

export default function DriversPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: drivers = [], isLoading } = useQuery({ queryKey: ['drivers'], queryFn: () => getDrivers() });

  const createMut = useMutation({
    mutationFn: createDriver,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver added!'); setDrawerOpen(false); },
    onError: () => toast.error('Failed to add driver'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DriverFormValues }) => updateDriver(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver updated!'); setDrawerOpen(false); setEditingDriver(null); },
    onError: () => toast.error('Failed to update driver'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['drivers'] }); toast.success('Driver removed'); setDeletingId(null); },
    onError: () => toast.error('Failed to remove driver'),
  });

  const filtered = useMemo(() => drivers.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.fullName.toLowerCase().includes(q) || d.employeeNumber.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q);
    const matchStatus = !filterStatus || d.status === filterStatus;
    return matchSearch && matchStatus;
  }), [drivers, search, filterStatus]);

  function openAdd() { setEditingDriver(null); setDrawerOpen(true); }
  function openEdit(d: Driver) { setEditingDriver(d); setDrawerOpen(true); }
  function handleSubmit(v: DriverFormValues) {
    if (editingDriver) updateMut.mutate({ id: editingDriver.id, data: v });
    else createMut.mutate(v);
  }

  const columns = [
    { key: 'empNo', header: 'Emp No.', render: (d: Driver) => <span className="font-mono text-xs text-blue-400">{d.employeeNumber}</span> },
    { key: 'name', header: 'Full Name', render: (d: Driver) => <span className="font-medium text-white">{d.fullName}</span> },
    { key: 'nic', header: 'NIC', render: (d: Driver) => <span className="text-xs">{d.nic}</span> },
    { key: 'license', header: 'License', render: (d: Driver) => (
      <div>
        <p className="text-xs">{d.licenseNumber}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-slate-500">Exp: {formatDate(d.licenseExpiryDate)}</p>
          <LicenseWarning date={d.licenseExpiryDate} />
        </div>
      </div>
    )},
    { key: 'contact', header: 'Contact', render: (d: Driver) => <span className="text-xs">{d.contactNumber}</span> },
    { key: 'depot', header: 'Depot', render: (d: Driver) => <span className="text-xs">{d.depot.name}</span> },
    { key: 'status', header: 'Status', render: (d: Driver) => <StatusBadge status={d.status} type="driver" /> },
    { key: 'actions', header: '', render: (d: Driver) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Pencil size={14} /></button>
        <button onClick={() => setDeletingId(d.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Driver Management"
        description="Manage your fleet drivers and licenses"
        icon={Users}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Drivers' }]}
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Driver</button>}
      />

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <SearchAndFilterBar
            searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search drivers…"
            filters={[{ key: 'status', label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Available', value: 'AVAILABLE' }, { label: 'Inactive', value: 'INACTIVE' }, { label: 'On Leave', value: 'ON_LEAVE' }] }]}
          />
        </div>
        {isLoading ? (
          <LoadingSkeleton variant="table" rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No drivers found" icon={Users} action={<button className="btn-primary" onClick={openAdd}><Plus size={14} /> Add Driver</button>} />
        ) : (
          <ResponsiveDataList
            data={filtered} columns={columns} keyExtractor={(d) => d.id}
            renderMobileTitle={(d) => d.fullName}
            renderMobileSubtitle={(d) => d.employeeNumber}
            renderMobileFields={(d) => [
              { label: 'NIC', value: d.nic },
              { label: 'License', value: d.licenseNumber },
              { label: 'Expiry', value: <span className="flex items-center gap-1">{formatDate(d.licenseExpiryDate)} <LicenseWarning date={d.licenseExpiryDate} /></span> },
              { label: 'Contact', value: d.contactNumber },
              { label: 'Depot', value: d.depot.name },
              { label: 'Status', value: <StatusBadge status={d.status} type="driver" /> },
            ]}
            renderMobileActions={(d) => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(d)} className="btn-secondary text-xs px-2 py-1"><Pencil size={12} /></button>
                <button onClick={() => setDeletingId(d.id)} className="btn-danger text-xs px-2 py-1"><Trash2 size={12} /></button>
              </div>
            )}
          />
        )}
      </div>

      <FormDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingDriver(null); }}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
        footer={<><button className="btn-secondary" onClick={() => { setDrawerOpen(false); setEditingDriver(null); }}>Cancel</button><button form="driver-form" type="submit" className="btn-primary">{editingDriver ? 'Save Changes' : 'Add Driver'}</button></>}
      >
        <DriverForm
          defaultValues={editingDriver ? { employeeNumber: editingDriver.employeeNumber, fullName: editingDriver.fullName, nic: editingDriver.nic, licenseNumber: editingDriver.licenseNumber, licenseExpiryDate: editingDriver.licenseExpiryDate, contactNumber: editingDriver.contactNumber, address: editingDriver.address, depotId: editingDriver.depot.id, status: editingDriver.status } : undefined}
          onSubmit={handleSubmit}
        />
      </FormDrawer>

      <ConfirmDialog open={!!deletingId} title="Remove Driver" message="This driver record will be permanently deleted."
        confirmLabel="Remove Driver" onConfirm={() => deletingId && deleteMut.mutate(deletingId)} onCancel={() => setDeletingId(null)} loading={deleteMut.isPending}
      />
    </div>
  );
}
