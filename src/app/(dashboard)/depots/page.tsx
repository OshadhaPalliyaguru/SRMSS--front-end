'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Building2, Plus, Pencil, Trash2, MapPin, Route, Bus, Users } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchAndFilterBar from '@/components/common/SearchAndFilterBar';
import FormDrawer from '@/components/forms/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { getDepots, createDepot, updateDepot, deleteDepot } from '@/lib/api/depotApi';
import { depotSchema, type DepotFormValues } from '@/lib/validators';
import type { Depot } from '@/types';

function DepotForm({ defaultValues, onSubmit, loading }: {
  defaultValues?: Partial<DepotFormValues>;
  onSubmit: (v: DepotFormValues) => void;
  loading: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<DepotFormValues>({
    resolver: zodResolver(depotSchema),
    defaultValues,
  });
  return (
    <form id="depot-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Depot Name *</label>
        <input {...register('name')} className="form-input" placeholder="Colombo Central Depot" />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Location *</label>
          <input {...register('location')} className="form-input" placeholder="Colombo 07" />
          {errors.location && <p className="form-error">{errors.location.message}</p>}
        </div>
        <div>
          <label className="form-label">Capacity (vehicles) *</label>
          <input {...register('capacity', { valueAsNumber: true })} type="number" className="form-input" placeholder="60" />
          {errors.capacity && <p className="form-error">{errors.capacity.message}</p>}
        </div>
      </div>
      <div>
        <label className="form-label">Full Address *</label>
        <input {...register('address')} className="form-input" placeholder="45 Baseline Rd, Colombo 00700" />
        {errors.address && <p className="form-error">{errors.address.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Manager Name *</label>
          <input {...register('managerName')} className="form-input" placeholder="Asanka Fernando" />
          {errors.managerName && <p className="form-error">{errors.managerName.message}</p>}
        </div>
        <div>
          <label className="form-label">Contact Number *</label>
          <input {...register('contactNumber')} className="form-input" placeholder="0112345678" />
          {errors.contactNumber && <p className="form-error">{errors.contactNumber.message}</p>}
        </div>
      </div>
    </form>
  );
}

export default function DepotsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: depots = [], isLoading } = useQuery({ queryKey: ['depots'], queryFn: () => getDepots() });

  const createMut = useMutation({
    mutationFn: createDepot,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['depots'] }); toast.success('Depot created!'); setDrawerOpen(false); },
    onError: () => toast.error('Failed to create depot'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DepotFormValues }) => updateDepot(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['depots'] }); toast.success('Depot updated!'); setDrawerOpen(false); setEditingDepot(null); },
    onError: () => toast.error('Failed to update depot'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteDepot,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['depots'] }); toast.success('Depot deleted'); setDeletingId(null); },
    onError: () => toast.error('Failed to delete depot'),
  });

  const filtered = useMemo(() =>
    depots.filter((d) => {
      const q = search.toLowerCase();
      return !q || d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q);
    }),
    [depots, search],
  );

  function openAdd() { setEditingDepot(null); setDrawerOpen(true); }
  function openEdit(d: Depot) { setEditingDepot(d); setDrawerOpen(true); }
  function handleSubmit(v: DepotFormValues) {
    if (editingDepot) updateMut.mutate({ id: editingDepot.id, data: v });
    else createMut.mutate(v);
  }

  return (
    <div>
      <PageHeader
        title="Depot Management"
        description="Manage your transport depots and their resources"
        icon={Building2}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Depots' }]}
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Depot</button>}
      />

      <div className="mb-4">
        <SearchAndFilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search depots by name or location…" />
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No depots found" description="Add your first depot to get started." icon={Building2} action={<button className="btn-primary" onClick={openAdd}><Plus size={14} /> Add Depot</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((depot, i) => (
            <motion.div
              key={depot.id}
              className="card p-5 hover:scale-[1.02] transition-transform duration-200"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-blue-400" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(depot)} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => setDeletingId(depot.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>

              <h3 className="font-semibold text-white text-sm mb-0.5">{depot.name}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                <MapPin size={11} /> {depot.location}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Route, value: depot.activeRoutes, label: 'Routes' },
                  { icon: Bus, value: depot.activeBuses, label: 'Buses' },
                  { icon: Users, value: depot.activeDrivers, label: 'Drivers' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-2 rounded-lg bg-white/3">
                    <p className="text-base font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
                <p>Manager: <span className="text-slate-300">{depot.managerName}</span></p>
                <p>Capacity: <span className="text-slate-300">{depot.capacity} vehicles</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <FormDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingDepot(null); }}
        title={editingDepot ? 'Edit Depot' : 'Add New Depot'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setDrawerOpen(false); setEditingDepot(null); }}>Cancel</button>
            <button form="depot-form" type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editingDepot ? 'Save Changes' : 'Create Depot'}
            </button>
          </>
        }
      >
        <DepotForm
          defaultValues={editingDepot ? { name: editingDepot.name, location: editingDepot.location, address: editingDepot.address, contactNumber: editingDepot.contactNumber, managerName: editingDepot.managerName, capacity: editingDepot.capacity } : undefined}
          onSubmit={handleSubmit}
          loading={createMut.isPending || updateMut.isPending}
        />
      </FormDrawer>

      <ConfirmDialog
        open={!!deletingId}
        title="Delete Depot"
        message="This depot and all associated data will be removed. This action cannot be undone."
        confirmLabel="Delete Depot"
        onConfirm={() => deletingId && deleteMut.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
