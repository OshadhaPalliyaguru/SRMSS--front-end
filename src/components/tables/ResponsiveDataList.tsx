'use client';

import { ReactNode } from 'react';
import DataTable from '@/components/tables/DataTable';
import MobileCardList from '@/components/cards/MobileCardList';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface MobileCardField {
  label: string;
  value: ReactNode;
  full?: boolean;
}

interface ResponsiveDataListProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  renderMobileTitle?: (row: T) => ReactNode;
  renderMobileSubtitle?: (row: T) => ReactNode;
  renderMobileFields: (row: T) => MobileCardField[];
  renderMobileActions?: (row: T) => ReactNode;
}

/**
 * Shows a DataTable on desktop (≥768px) and MobileCardList on mobile.
 * No horizontal overflow on mobile.
 */
export default function ResponsiveDataList<T>({
  data, columns, keyExtractor,
  renderMobileTitle, renderMobileSubtitle, renderMobileFields, renderMobileActions,
}: ResponsiveDataListProps<T>) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable
          data={data}
          columns={columns}
          keyExtractor={keyExtractor}
        />
      </div>

      {/* Mobile card list */}
      <div className="md:hidden">
        <MobileCardList
          data={data}
          keyExtractor={keyExtractor}
          renderTitle={renderMobileTitle}
          renderSubtitle={renderMobileSubtitle}
          renderFields={renderMobileFields}
          renderActions={renderMobileActions}
        />
      </div>
    </>
  );
}
