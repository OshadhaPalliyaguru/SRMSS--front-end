'use client';

import { Bell, Search, LogOut, User, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, getInitials } from '@/lib/utils';

interface TopbarProps {
  collapsed: boolean;
  onMobileMenuOpen: () => void;
}

export default function Topbar({ collapsed, onMobileMenuOpen }: TopbarProps) {
  const router = useRouter();
  // Read user from localStorage (set at login)
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('srmss_user') : null;
  const user = userStr ? JSON.parse(userStr) : { name: 'Admin User', email: 'admin@srmss.lk', role: 'ADMIN' };

  function handleLogout() {
    localStorage.removeItem('srmss_token');
    localStorage.removeItem('srmss_user');
    router.push('/login');
  }

  return (
    <header className={cn('topbar', collapsed && 'collapsed')}>
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/4 border border-white/6 text-slate-500 hover:border-white/10 transition-colors">
        <Search size={15} />
        <span className="text-sm">Quick search…</span>
      </div>

      <div className="flex-1 md:flex-none" />

      {/* Notifications */}
      <button className="relative p-2.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
      </button>

      {/* User avatar + dropdown */}
      <div className="flex items-center gap-3 pl-3 border-l border-white/6">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {getInitials(user.name)}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
