'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MobileCardField {
  label: string;
  value: ReactNode;
  full?: boolean;
}

interface MobileCardListProps<T> {
  data: T[];
  keyExtractor: (row: T) => string | number;
  renderFields: (row: T) => MobileCardField[];
  renderActions?: (row: T) => ReactNode;
  renderTitle?: (row: T) => ReactNode;
  renderSubtitle?: (row: T) => ReactNode;
}

export default function MobileCardList<T>({
  data, keyExtractor, renderFields, renderActions, renderTitle, renderSubtitle,
}: MobileCardListProps<T>) {
  return (
    <div className="space-y-3">
      {data.map((row, i) => (
        <motion.div
          key={keyExtractor(row)}
          className="card p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          {/* Title row */}
          {(renderTitle || renderSubtitle) && (
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="min-w-0">
                {renderTitle && <p className="font-semibold text-white text-sm truncate">{renderTitle(row)}</p>}
                {renderSubtitle && <p className="text-xs text-slate-500 mt-0.5">{renderSubtitle(row)}</p>}
              </div>
              {renderActions && (
                <div className="flex-shrink-0">{renderActions(row)}</div>
              )}
            </div>
          )}

          {/* Fields grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {renderFields(row).map((field, fi) => (
              <div key={fi} className={field.full ? 'col-span-2' : ''}>
                <p className="text-xs text-slate-500 mb-0.5">{field.label}</p>
                <div className="text-sm text-slate-300">{field.value}</div>
              </div>
            ))}
          </div>

          {/* Actions at bottom if no title row */}
          {renderActions && !renderTitle && !renderSubtitle && (
            <div className="mt-3 pt-3 border-t border-white/5 flex justify-end gap-2">
              {renderActions(row)}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
