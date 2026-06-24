import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'stat' | 'text';
  rows?: number;
  className?: string;
}

function SkeletonBox({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('animate-shimmer rounded-lg', className)} style={style} />;
}

export default function LoadingSkeleton({ variant = 'table', rows = 5, className }: LoadingSkeletonProps) {
  if (variant === 'stat') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card p-5">
            <SkeletonBox className="w-10 h-10 mb-4" />
            <SkeletonBox className="h-7 w-24 mb-2" />
            <SkeletonBox className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <SkeletonBox className="h-5 w-3/4" />
            <SkeletonBox className="h-4 w-1/2" />
            <SkeletonBox className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBox key={i} className="h-4" style={{ width: `${70 + Math.random() * 25}%` }} />
        ))}
      </div>
    );
  }

  // table variant
  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="p-4 border-b border-white/5 flex gap-4">
        <SkeletonBox className="h-9 flex-1 max-w-xs" />
        <SkeletonBox className="h-9 w-24" />
      </div>
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: 5 }).map((_, i) => (
              <th key={i} className="p-3">
                <SkeletonBox className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-white/5">
              {Array.from({ length: 5 }).map((_, j) => (
                <td key={j} className="p-3">
                  <SkeletonBox className={cn('h-4', j === 0 ? 'w-28' : j === 4 ? 'w-16' : 'w-24')} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
