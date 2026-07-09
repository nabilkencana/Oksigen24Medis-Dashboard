import React from 'react';

export function Table({ children, className = '' }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-muted/40 border-b border-border [&_tr]:border-b-0 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-border transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-xs [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-border/40">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start}</span> to{' '}
        <span className="font-medium text-foreground">{end}</span> of{' '}
        <span className="font-medium text-foreground">{totalItems}</span> entries
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span className="sr-only">Previous page</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // simple pagination range helper
          let pageNum = i + 1;
          if (currentPage > 3 && totalPages > 5) {
            pageNum = currentPage - 3 + i;
            if (pageNum + (4 - i) > totalPages) {
              pageNum = totalPages - 4 + i;
            }
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-foreground hover:bg-accent'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <span className="sr-only">Next page</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
