'use client';

import { Settings, User, Bell, Globe, Shield, Database } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/common/PageHeader';

export default function SettingsPage() {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('srmss_user') : null;
  const user = userStr ? JSON.parse(userStr) : { name: 'Admin User', email: 'admin@srmss.lk', role: 'ADMIN' };

  function handleSave() {
    toast.success('Settings saved', { description: 'Your preferences have been updated.' });
  }

  const sections = [
    {
      icon: User, title: 'Profile', color: 'text-blue-400 bg-blue-500/10',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Full Name</label>
              <input className="form-input" defaultValue={user.name} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" defaultValue={user.email} type="email" />
            </div>
          </div>
          <div>
            <label className="form-label">Role</label>
            <input className="form-input" value={user.role} disabled />
          </div>
        </div>
      ),
    },
    {
      icon: Bell, title: 'Notifications', color: 'text-amber-400 bg-amber-500/10',
      content: (
        <div className="space-y-3">
          {[
            { label: 'License expiry alerts', desc: 'Notify when driver licenses are expiring within 30 days' },
            { label: 'Maintenance reminders', desc: 'Notify when vehicles are due for service' },
            { label: 'Delayed schedule alerts', desc: 'Notify when schedules are running late' },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm text-white">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Globe, title: 'System', color: 'text-emerald-400 bg-emerald-500/10',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Time Zone</label>
              <select className="form-input appearance-none"><option>Asia/Colombo (UTC+5:30)</option></select>
            </div>
            <div>
              <label className="form-label">Date Format</label>
              <select className="form-input appearance-none"><option>DD MMM YYYY</option><option>YYYY-MM-DD</option></select>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Database, title: 'API Configuration', color: 'text-purple-400 bg-purple-500/10',
      content: (
        <div className="space-y-3">
          <div>
            <label className="form-label">API Base URL</label>
            <input className="form-input font-mono text-xs" value={process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'} readOnly />
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-400">
            ✓ Configure the backend URL via the <code className="bg-white/5 px-1 rounded">.env.local</code> file using <code className="bg-white/5 px-1 rounded">NEXT_PUBLIC_API_BASE_URL</code>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and system preferences"
        icon={Settings}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
        actions={<button className="btn-primary" onClick={handleSave}>Save Changes</button>}
      />

      <div className="space-y-4 max-w-3xl">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2 rounded-lg ${section.color}`}><Icon size={16} /></div>
                <h2 className="text-sm font-semibold text-white">{section.title}</h2>
              </div>
              {section.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
