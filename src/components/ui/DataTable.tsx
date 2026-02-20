"use client";

import { ReactNode, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, Download, Trash2, Search } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { EmptyState } from './EmptyState';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount?: number;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  getRowId?: (item: T) => string;
  bulkActions?: { label: string; onClick: (ids: Set<string>) => void; variant?: 'danger' | 'default' }[];
  exportable?: boolean;
  exportFilename?: string;
  emptyState?: ReactNode;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
}

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-white/5 rounded w-1/2"></div>
  </div>
);



export const DataTable = <T,>({
  columns,
  data,
  totalCount,
  isLoading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  sortBy,
  sortDir,
  onSort,
  page = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  getRowId = (item: T) => (item as Record<string, unknown>).id as string || '',
  bulkActions = [],
  exportable = false,
  exportFilename = 'data',
  emptyState,
  rowClassName,
  onRowClick
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    onSort(columnKey);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      const allIds = new Set(data.map(getRowId));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleRowSelect = (itemId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    onSelectionChange(newSelection);
  };

  const handleRowClick = (item: T, e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    
    if (selectable && onSelectionChange) {
      const itemId = getRowId(item);
      const newSelection = new Set(selectedIds);
      if (selectedIds.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      onSelectionChange(newSelection);
    }
    
    onRowClick?.(item);
  };

  const exportToCsv = useCallback(() => {
    const headers = columns.map(col => col.label);
    const rows = data.map(item => 
      columns.map(col => {
        const value = col.render ? 'rendered' : (item as Record<string, unknown>)[col.key];
        return typeof value === 'string' ? value : JSON.stringify(value);
      })
    );
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFilename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [columns, data, exportFilename]);

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;
  
  const totalPages = Math.ceil((totalCount || data.length) / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount || data.length);

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange?.(i)}
          className={`
            px-3 py-1 text-sm rounded transition-all
            ${i === page 
              ? 'border border-white/30 bg-black/40 text-white' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
            }
          `}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="w-64">
            <SearchInput
              value=""
              onChange={() => {}}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        
        <div className="border border-white/10 bg-black/30 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {selectable && <th className="w-12 p-3"></th>}
                  {columns.map((column) => (
                    <th key={column.key} className="text-left p-3 text-xs text-white/40 font-normal">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {selectable && <td className="p-3"></td>}
                    {columns.map((column) => (
                      <td key={column.key} className="p-3">
                        <LoadingSkeleton />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="w-64">
            <SearchInput
              value={searchQuery}
              onChange={(value: string) => {
                setSearchQuery(value);
                onSearch?.(value);
              }}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        
        {emptyState || (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No data found"
            description="Try adjusting your search or filters"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {searchable && (
            <div className="w-64">
              <SearchInput
                value={searchQuery}
                onChange={(value: string) => {
                  setSearchQuery(value);
                  onSearch?.(value);
                }}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {exportable && (
            <button
              onClick={exportToCsv}
              className="border border-white/20 hover:border-white/40 text-white rounded px-3 py-1.5 text-sm transition-all flex items-center gap-2"
            >
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && bulkActions.length > 0 && (
        <div className="border border-white/10 bg-black/40 rounded p-3 flex items-center justify-between">
          <span className="text-white/60 text-sm">
            {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, i) => (
              <button
                key={i}
                onClick={() => action.onClick(selectedIds)}
                className={`
                  border rounded px-3 py-1.5 text-sm transition-all flex items-center gap-2
                  ${action.variant === 'danger' 
                    ? 'border-red-400/30 text-red-400 hover:border-red-400/50' 
                    : 'border-white/20 hover:border-white/40 text-white'
                  }
                `}
              >
                {action.variant === 'danger' && <Trash2 size={14} />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border border-white/10 bg-black/30 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {selectable && (
                  <th className="w-12 p-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-white/20 bg-transparent text-white focus:ring-2 focus:ring-white/20"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className="text-left p-3 text-xs text-white/40 font-normal"
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:text-white/60 transition-all"
                      >
                        {column.label}
                        {sortBy === column.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <div className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const itemId = getRowId(item);
                const isSelected = selectedIds.has(itemId);
                return (
                  <tr
                    key={itemId}
                    onClick={(e) => handleRowClick(item, e)}
                    className={`
                      border-b border-white/5 hover:bg-white/[0.02] transition-all
                      ${selectable ? 'cursor-pointer' : ''}
                      ${isSelected ? 'bg-white/[0.02]' : ''}
                      ${rowClassName ? rowClassName(item) : ''}
                    `}
                  >
                    {selectable && (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(itemId, e.target.checked)}
                          className="rounded border-white/20 bg-transparent text-white focus:ring-2 focus:ring-white/20"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="p-3 text-white/90 text-sm">
                        {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(totalCount || data.length) > pageSize && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm">Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-white/30"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-white/40 text-sm">
              Showing {startItem}-{endItem} of {totalCount || data.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm rounded transition-all text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {renderPaginationNumbers()}
            
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm rounded transition-all text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};