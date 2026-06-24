'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Route as RouteIcon, Plus, Pencil, Trash2, Eye, MapPin, Clock, Navigation } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchAndFilterBar from '@/components/common/SearchAndFilterBar';
import StatusBadge from '@/components/common/StatusBadge';
import FormDrawer from '@/components/forms/FormDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import ResponsiveDataList from '@/components/tables/ResponsiveDataList';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '@/lib/api/routeApi';
import { getDepots } from '@/lib/api/depotApi';
import { routeSchema, type RouteFormValues } from '@/lib/validators';
import type { Route } from '@/types';

// Detail modal for route stops + map placeholder
function RouteDetailModal({ route, onClose }: { route: Route; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative card w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
      >
        <div className="p-6 border-b border-white/6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{route.routeCode}</p>
              <h2 className="text-lg font-bold text-white">{route.routeName}</h2>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Navigation size={11} />{route.totalDistance} km</span>
                <span className="flex items-center gap-1"><Clock size={11} />{route.estimatedDuration} min</span>
                <StatusBadge status={route.status} type="route" />
              </div>
            </div>
            <button onClick={onClose} className="btn-secondary text-xs">Close</button>
          </div>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Stops */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" /> Route Stops
            </h3>
            <div className="space-y-2">
              {route.stops.length === 0 ? (
                <p className="text-xs text-slate-500">No stops added yet.</p>
              ) : (
                route.stops.map((stop, i) => (
                  <div key={stop.id} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 || i === route.stops.length - 1 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{stop.stopOrder}</div>
                      {i < route.stops.length - 1 && <div className="w-px h-4 bg-slate-600 mt-1" />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">{stop.stopName}</p>
                      <p className="text-xs text-slate-500">+{stop.estimatedTime} min</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Map placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-400" /> Route Map
            </h3>
            <div className="h-48 rounded-xl bg-navy-800 border border-white/6 flex flex-col items-center justify-center gap-2 text-slate-500">
              <MapPin size={28} className="opacity-30" />
              <p className="text-xs text-center">Google Maps integration<br />coming soon</p>
              <p className="text-xs text-slate-600">{route.startPoint} → {route.endPoint}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Route form inside a FormDrawer
function RouteForm({ defaultValues, onSubmit, loading }: {
  defaultValues?: Partial<RouteFormValues>;
  onSubmit: (v: RouteFormValues) => void;
  loading: boolean;
}) {
  const { data: depots = [] } = useQuery({ queryKey: ['depots'], queryFn: () => getDepots() });
  const { register, handleSubmit, formState: { errors } } = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: { status: 'ACTIVE', ...defaultValues },
  });

  return (
    <form id="route-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Route Code *</label>
          <input {...register('routeCode')} className="form-input" placeholder="RT-001" />
          {errors.routeCode && <p className="form-error">{errors.routeCode.message}</p>}
        </div>
        <div>
          <label className="form-label">Status *</label>
          <select {...register('status')} className="form-input appearance-none">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Route Name *</label>
        <input {...register('routeName')} className="form-input" placeholder="Colombo – Kandy Express" />
        {errors.routeName && <p className="form-error">{errors.routeName.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Start Point *</label>
          <input {...register('startPoint')} className="form-input" placeholder="Colombo Fort" />
          {errors.startPoint && <p className="form-error">{errors.startPoint.message}</p>}
        </div>
        <div>
          <label className="form-label">End Point *</label>
          <input {...register('endPoint')} className="form-input" placeholder="Kandy Bus Stand" />
          {errors.endPoint && <p className="form-error">{errors.endPoint.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Distance (km) *</label>
          <input {...register('totalDistance', { valueAsNumber: true })} type="number" step="0.1" className="form-input" placeholder="116" />
          {errors.totalDistance && <p className="form-error">{errors.totalDistance.message}</p>}
        </div>
        <div>
          <label className="form-label">Duration (min) *</label>
          <input {...register('estimatedDuration', { valueAsNumber: true })} type="number" className="form-input" placeholder="180" />
          {errors.estimatedDuration && <p className="form-error">{errors.estimatedDuration.message}</p>}
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
    </form>
  );
}

export default function RoutesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterDepot, setFilterDepot] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [viewingRoute, setViewingRoute] = useState<Route | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: routes = [], isLoading } = useQuery({ queryKey: ['routes'], queryFn: () => getRoutes() });
  const { data: depots = [] } = useQuery({ queryKey: ['depots'], queryFn: () => getDepots() });

  const createMut = useMutation({
    mutationFn: createRoute,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['routes'] }); toast.success('Route created!'); setDrawerOpen(false); },
    onError: () => toast.error('Failed to create route'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RouteFormValues }) => updateRoute(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['routes'] }); toast.success('Route updated!'); setDrawerOpen(false); setEditingRoute(null); },
    onError: () => toast.error('Failed to update route'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['routes'] }); toast.success('Route deleted'); setDeletingId(null); },
    onError: () => toast.error('Failed to delete route'),
  });

  const filtered = useMemo(() => routes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.routeName.toLowerCase().includes(q) || r.routeCode.toLowerCase().includes(q) || r.startPoint.toLowerCase().includes(q);
    const matchDepot = !filterDepot || String(r.depot.id) === filterDepot;
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchDepot && matchStatus;
  }), [routes, search, filterDepot, filterStatus]);

  function openAdd() { setEditingRoute(null); setDrawerOpen(true); }
  function openEdit(r: Route) { setEditingRoute(r); setDrawerOpen(true); }
  function handleSubmit(v: RouteFormValues) {
    if (editingRoute) updateMut.mutate({ id: editingRoute.id, data: v });
    else createMut.mutate(v);
  }

  const columns = [
    { key: 'routeCode', header: 'Code', render: (r: Route) => <span className="font-mono text-xs text-blue-400">{r.routeCode}</span> },
    { key: 'routeName', header: 'Route Name', render: (r: Route) => <span className="font-medium text-white">{r.routeName}</span> },
    { key: 'start', header: 'Start → End', render: (r: Route) => <span className="text-xs">{r.startPoint} → {r.endPoint}</span> },
    { key: 'distance', header: 'Distance', render: (r: Route) => <span>{r.totalDistance} km</span> },
    { key: 'duration', header: 'Duration', render: (r: Route) => <span>{r.estimatedDuration} min</span> },
    { key: 'depot', header: 'Depot', render: (r: Route) => <span className="text-xs">{r.depot.name}</span> },
    { key: 'status', header: 'Status', render: (r: Route) => <StatusBadge status={r.status} type="route" /> },
    {
      key: 'actions', header: '', render: (r: Route) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewingRoute(r)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="View"><Eye size={14} /></button>
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => setDeletingId(r.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Route Planning"
        description="Manage and configure transport routes"
        icon={RouteIcon}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Routes' }]}
        actions={<button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Route</button>}
      />

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <SearchAndFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search routes…"
            filters={[
              { key: 'depot', label: 'Depot', value: filterDepot, onChange: setFilterDepot, options: depots.map((d) => ({ label: d.name, value: String(d.id) })) },
              { key: 'status', label: 'Status', value: filterStatus, onChange: setFilterStatus, options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }, { label: 'Suspended', value: 'SUSPENDED' }] },
            ]}
          />
        </div>

        {isLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No routes found" description="Try a different search or add a new route." icon={RouteIcon} action={<button className="btn-primary" onClick={openAdd}><Plus size={14} /> Add Route</button>} />
        ) : (
          <ResponsiveDataList
            data={filtered}
            columns={columns}
            keyExtractor={(r) => r.id}
            renderMobileTitle={(r) => r.routeName}
            renderMobileSubtitle={(r) => r.routeCode}
            renderMobileFields={(r) => [
              { label: 'Route', value: `${r.startPoint} → ${r.endPoint}` },
              { label: 'Distance', value: `${r.totalDistance} km` },
              { label: 'Duration', value: `${r.estimatedDuration} min` },
              { label: 'Depot', value: r.depot.name },
              { label: 'Status', value: <StatusBadge status={r.status} type="route" /> },
            ]}
            renderMobileActions={(r) => (
              <div className="flex gap-2">
                <button onClick={() => setViewingRoute(r)} className="btn-secondary text-xs px-2 py-1"><Eye size={12} /></button>
                <button onClick={() => openEdit(r)} className="btn-secondary text-xs px-2 py-1"><Pencil size={12} /></button>
                <button onClick={() => setDeletingId(r.id)} className="btn-danger text-xs px-2 py-1"><Trash2 size={12} /></button>
              </div>
            )}
          />
        )}
      </div>

      {/* Form Drawer */}
      <FormDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingRoute(null); }}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
        description={editingRoute ? `Editing ${editingRoute.routeCode}` : 'Fill in the details to create a new route'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setDrawerOpen(false); setEditingRoute(null); }}>Cancel</button>
            <button form="route-form" type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving…' : editingRoute ? 'Save Changes' : 'Create Route'}
            </button>
          </>
        }
      >
        <RouteForm
          defaultValues={editingRoute ? { routeCode: editingRoute.routeCode, routeName: editingRoute.routeName, startPoint: editingRoute.startPoint, endPoint: editingRoute.endPoint, totalDistance: editingRoute.totalDistance, estimatedDuration: editingRoute.estimatedDuration, depotId: editingRoute.depot.id, status: editingRoute.status } : undefined}
          onSubmit={handleSubmit}
          loading={createMut.isPending || updateMut.isPending}
        />
      </FormDrawer>

      {/* Detail modal */}
      {viewingRoute && <RouteDetailModal route={viewingRoute} onClose={() => setViewingRoute(null)} />}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deletingId}
        title="Delete Route"
        message="This route will be permanently removed. Existing schedules may be affected."
        confirmLabel="Delete Route"
        onConfirm={() => deletingId && deleteMut.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
