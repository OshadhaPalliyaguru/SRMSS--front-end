'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
  actions?: ReactNode;
}

export default function ChartCard({
  title, description, children, isLoading, isEmpty, className, actions,
}: ChartCardProps) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>

      {isLoading ? (
        <div className="h-48">
          <LoadingSkeleton variant="text" rows={6} />
        </div>
      ) : isEmpty ? (
        <EmptyState title="No chart data" description="Data will appear here once available." />
      ) : (
        children
      )}
    </div>
  );
}
