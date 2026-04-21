"use client";

import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  Table as TableInstance,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableControllerProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  emptyMessage?: string;
  tableInstance?: TableInstance<TData>;
  pageSize?: number;
  // Manual pagination props
  pageCount?: number;
  pageIndex?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  manualPagination?: boolean;
  totalItems?: number;
  onRowClick?: (data: TData) => void;
}

export function TableController<TData>({
  data,
  columns,
  loading,
  emptyMessage = "No results.",
  tableInstance: providedTable,
  pageSize = 10,
  pageCount,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  manualPagination,
  totalItems,
  onRowClick,
}: TableControllerProps<TData>) {
  // Use the provided tableInstance or create one locally
  const defaultTable = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
        ...(pageIndex !== undefined && {
            pagination: {
                pageIndex,
                pageSize,
            },
        }),
    },
    onPaginationChange: (updater) => {
        if (typeof updater === 'function' && pageIndex !== undefined && onPageChange) {
            const nextState = updater({ pageIndex: pageIndex || 0, pageSize: pageSize || 10 });
            onPageChange(nextState.pageIndex);
            onPageSizeChange?.(nextState.pageSize);
        }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: !manualPagination ? getPaginationRowModel() : undefined,
    manualPagination: manualPagination,
    initialState: {
        pagination: {
            pageSize: pageSize,
        },
    },
  });

  const table = providedTable || defaultTable;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Hydrating Content...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50 border-b border-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="h-14 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-6"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "group border-b border-gray-50 hover:bg-brand/5 transition-colors duration-300",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                        <Loader2 className="w-6 h-6 opacity-20" />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Premium Pagination Footer */}
      <div className="px-8 py-4 flex flex-col sm:flex-row items-center justify-between bg-white border-t border-gray-50 gap-4">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Rows</p>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                        const newSize = Number(e.target.value);
                        table.setPageSize(newSize);
                        onPageSizeChange?.(newSize);
                    }}
                    className="bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold px-2 py-1 outline-none focus:ring-1 focus:ring-brand/20 transition-all cursor-pointer hover:bg-gray-100"
                >
                    {[5, 10, 20, 30, 50].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
                {totalItems !== undefined ? (
                    <>Showing <span className="text-gray-900">{Math.min((pageIndex || 0) * pageSize + 1, totalItems)}</span> to <span className="text-gray-900">{Math.min(((pageIndex || 0) + 1) * pageSize, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span></>
                ) : (
                    <>Page <span className="text-gray-900">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-gray-900">{table.getPageCount()}</span></>
                )}
            </div>
        </div>

        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                className="w-8 h-8 p-0 rounded-lg border-gray-100 hover:bg-brand hover:text-white hover:border-brand transition-all disabled:opacity-20"
                onClick={() => {
                    table.setPageIndex(0);
                    onPageChange?.(0);
                }}
                disabled={!table.getCanPreviousPage()}
            >
                <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
                variant="outline"
                className="w-8 h-8 p-0 rounded-lg border-gray-100 hover:bg-brand hover:text-white hover:border-brand transition-all disabled:opacity-20"
                onClick={() => {
                    table.previousPage();
                    onPageChange?.((pageIndex || 0) - 1);
                }}
                disabled={!table.getCanPreviousPage()}
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1.5 px-3 min-w-[80px] justify-center">
                <span className="text-[11px] font-black text-brand bg-brand/5 px-2 py-0.5 rounded-md">
                    {table.getState().pagination.pageIndex + 1}
                </span>
                <span className="text-[10px] font-bold text-gray-300">/</span>
                <span className="text-[11px] font-black text-gray-400">
                    {table.getPageCount()}
                </span>
            </div>

            <Button
                variant="outline"
                className="w-8 h-8 p-0 rounded-lg border-gray-100 hover:bg-brand hover:text-white hover:border-brand transition-all disabled:opacity-20"
                onClick={() => {
                    table.nextPage();
                    onPageChange?.((pageIndex || 0) + 1);
                }}
                disabled={!table.getCanNextPage()}
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
                variant="outline"
                className="w-8 h-8 p-0 rounded-lg border-gray-100 hover:bg-brand hover:text-white hover:border-brand transition-all disabled:opacity-20"
                onClick={() => {
                    const lastPage = table.getPageCount() - 1;
                    table.setPageIndex(lastPage);
                    onPageChange?.(lastPage);
                }}
                disabled={!table.getCanNextPage()}
            >
                <ChevronsRight className="w-4 h-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
