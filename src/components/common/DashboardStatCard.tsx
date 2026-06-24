'use client';

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accent: 'blue' | 'emerald' | 'amber' | 'purple' | 'red' | 'cyan' | 'rose' | 'teal' | 'orange';
  suffix?: string;
  prefix?: string;
  description?: string;
  index?: number;
}

const ICON_COLORS = {
  blue:    'text-blue-400    bg-blue-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
  amber:   'text-amber-400   bg-amber-500/10',
  purple:  'text-purple-400  bg-purple-500/10',
  red:     'text-red-400     bg-red-500/10',
  cyan:    'text-cyan-400    bg-cyan-500/10',
  rose:    'text-rose-400    bg-rose-500/10',
  teal:    'text-teal-400    bg-teal-500/10',
  orange:  'text-orange-400  bg-orange-500/10',
};

/** Animated number count-up hook */
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setVal(Math.round(ease * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return val;
}

export default function DashboardStatCard({
  title, value, icon: Icon, accent, suffix = '', prefix = '', description, index = 0,
}: DashboardStatCardProps) {
  const isNumber = typeof value === 'number';
  const animated = useCountUp(isNumber ? value : 0, 1200, index * 100);
  const display = isNumber ? animated : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      className={cn('card p-5 cursor-default', `stat-accent-${accent}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', ICON_COLORS[accent])}>
          <Icon size={20} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-white tabular-nums">
          {prefix}{display}{suffix}
        </p>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </motion.div>
  );
}
