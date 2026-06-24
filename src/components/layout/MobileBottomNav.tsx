'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
              isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon size={20} />
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-blue-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
