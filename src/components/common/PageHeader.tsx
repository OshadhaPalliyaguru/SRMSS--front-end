import { type LucideIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title, description, icon: Icon, breadcrumbs, actions, className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-3 text-xs text-slate-500">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-300 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-400">{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight size={11} />}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0">
              <Icon size={22} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
