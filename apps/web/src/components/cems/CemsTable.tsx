"use client";

import React, { useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Loader2,
  Columns3,
  Check,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

/* ─── Props ────────────────────────────────────────────────────── */
interface CemsTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;

  /* Manual / server-side pagination */
  pageCount?: number;
  pageIndex?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  manualPagination?: boolean;
  totalItems?: number;

  /* TanStack features (opt-in) */
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  enableGlobalFilter?: boolean;

  /* Callbacks */
  onRowClick?: (data: TData) => void;
  onSelectionChange?: (selected: TData[]) => void;

  /** External table instance (advanced usage) */
  tableInstance?: TableInstance<TData>;

  /** Hide the toolbar */
  hideToolbar?: boolean;

  className?: string;
}

/**
 * CEMS Table — full-featured branded data-table.
 *
 * Wraps shadcn Table + @tanstack/react-table with:
 *  - Sorting (click headers)
 *  - Global search
 *  - Column visibility toggle
 *  - Row selection (checkbox)
 *  - Compact, space-efficient rows
 *  - Branded pagination
 */
export function CemsTable<TData>({
  data,
  columns: userColumns,
  loading,
  emptyMessage = "No results.",
  pageSize: initialPageSize = 10,
  pageCount,
  pageIndex: controlledPageIndex,
  onPageChange,
  onPageSizeChange,
  manualPagination,
  totalItems,
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enableRowSelection = false,
  enableGlobalFilter = true,
  onRowClick,
  onSelectionChange,
  tableInstance: providedTable,
  hideToolbar = false,
  className,
}: CemsTableProps<TData>) {
  /* ── Local state ────────────────────────────────────────────── */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  /* ── Prepend selection column if enabled ─────────────────────── */
  const columns = useMemo(() => {
    if (!enableRowSelection) return userColumns;
    const selectionCol: ColumnDef<TData, any> = {
      id: "__select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    };
    return [selectionCol, ...userColumns];
  }, [userColumns, enableRowSelection]);

  /* ── Build table ─────────────────────────────────────────────── */
  const defaultTable = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
      ...(controlledPageIndex !== undefined && {
        pagination: {
          pageIndex: controlledPageIndex,
          pageSize: initialPageSize,
        },
      }),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      // Fire selection callback
      if (onSelectionChange) {
        const next = typeof updater === "function" ? updater(rowSelection) : updater;
        const selectedRows = Object.keys(next)
          .filter((k) => next[k as keyof typeof next])
          .map((idx) => data[Number(idx)])
          .filter(Boolean);
        onSelectionChange(selectedRows);
      }
    },
    onPaginationChange: (updater) => {
      if (
        typeof updater === "function" &&
        controlledPageIndex !== undefined &&
        onPageChange
      ) {
        const nextState = updater({
          pageIndex: controlledPageIndex || 0,
          pageSize: initialPageSize,
        });
        onPageChange(nextState.pageIndex);
        onPageSizeChange?.(nextState.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    ...(!manualPagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    manualPagination,
    enableSorting,
    enableFilters: enableFiltering,
    enableGlobalFilter,
    initialState: {
      pagination: { pageSize: initialPageSize },
    },
  });

  const table = providedTable || defaultTable;

  /* ── Loading state ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Loading...
        </p>
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────────────────── */
  const visibleColumns = table
    .getAllColumns()
    .filter((c) => c.getCanHide() && c.id !== "__select");

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* ─── Toolbar ─────────────────────────────────────────── */}
      {!hideToolbar && (enableGlobalFilter || enableColumnVisibility) && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
          {/* Global Search */}
          {enableGlobalFilter && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-brand/20 focus:border-brand/30 transition-all"
              />
            </div>
          )}

          <div className="flex-1" />

          {/* Column Visibility Toggle — simple popover */}
          {enableColumnVisibility && (
            <ColumnVisibilityPopover columns={visibleColumns} />
          )}
        </div>
      )}

      {/* ─── Table ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-gray-50/50 border-b border-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-none"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "h-10 text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-5",
                        canSort &&
                          "cursor-pointer select-none hover:text-gray-800 transition-colors",
                      )}
                      style={
                        header.column.columnDef.size
                          ? { width: header.column.columnDef.size }
                          : undefined
                      }
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {canSort && (
                          <span className="ml-0.5">
                            {sorted === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-30" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
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
                    "border-b border-gray-100 hover:bg-brand/[0.06] transition-colors duration-150",
                    onRowClick && "cursor-pointer",
                    row.getIsSelected() && "bg-brand/5",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      <Search className="w-5 h-5 opacity-40" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500">
                      {emptyMessage}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Pagination Footer ───────────────────────────────── */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 gap-3 bg-gray-50/40">
        {/* Left: rows-per-page + info */}
        <div className="flex items-center gap-4 text-[10px]">
          {enableRowSelection && (
            <span className="font-bold text-gray-400">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} selected
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400 uppercase tracking-widest">
              Rows
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                table.setPageSize(newSize);
                onPageSizeChange?.(newSize);
              }}
              className="bg-white border border-gray-200 rounded-md text-[10px] font-semibold px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-brand/20 cursor-pointer"
            >
              {[5, 10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
            {totalItems !== undefined ? (
              <>
                <span className="text-gray-700">
                  {Math.min(
                    (controlledPageIndex || table.getState().pagination.pageIndex) *
                      table.getState().pagination.pageSize +
                      1,
                    totalItems,
                  )}
                </span>
                –
                <span className="text-gray-700">
                  {Math.min(
                    ((controlledPageIndex || table.getState().pagination.pageIndex) + 1) *
                      table.getState().pagination.pageSize,
                    totalItems,
                  )}
                </span>{" "}
                of <span className="text-gray-700">{totalItems}</span>
              </>
            ) : (
              <>
                Page{" "}
                <span className="text-gray-700">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="text-gray-700">{table.getPageCount()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: pagination buttons */}
        <div className="flex items-center gap-1">
          <PaginationButton
            onClick={() => {
              table.setPageIndex(0);
              onPageChange?.(0);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </PaginationButton>
          <PaginationButton
            onClick={() => {
              table.previousPage();
              onPageChange?.(
                (controlledPageIndex ||
                  table.getState().pagination.pageIndex) - 1,
              );
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </PaginationButton>

          <div className="flex items-center gap-1 px-2 min-w-[60px] justify-center">
            <span className="text-[10px] font-black text-brand bg-brand/5 px-1.5 py-0.5 rounded">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="text-[10px] font-bold text-gray-300">/</span>
            <span className="text-[10px] font-bold text-gray-400">
              {table.getPageCount()}
            </span>
          </div>

          <PaginationButton
            onClick={() => {
              table.nextPage();
              onPageChange?.(
                (controlledPageIndex ||
                  table.getState().pagination.pageIndex) + 1,
              );
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </PaginationButton>
          <PaginationButton
            onClick={() => {
              const lastPage = table.getPageCount() - 1;
              table.setPageIndex(lastPage);
              onPageChange?.(lastPage);
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}

/* ─── Internal: Column visibility popover ──────────────────────── */
function ColumnVisibilityPopover({ columns }: { columns: any[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[10px] font-bold uppercase tracking-wider transition-all",
          open
            ? "border-brand/30 text-brand bg-brand/5"
            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-600",
        )}
      >
        <Columns3 className="w-3.5 h-3.5" />
        Columns
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] rounded-xl bg-white p-1.5 shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 animate-in fade-in-0 zoom-in-95 duration-150">
          <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Toggle Columns
          </p>
          <div className="h-px bg-gray-100 mx-1.5 my-1" />
          {columns.map((column) => (
            <button
              key={column.id}
              onClick={() => column.toggleVisibility(!column.getIsVisible())}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-brand/5 hover:text-brand transition-colors cursor-pointer"
            >
              <span
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                  column.getIsVisible()
                    ? "bg-brand border-brand text-white"
                    : "border-gray-300 bg-white",
                )}
              >
                {column.getIsVisible() && <Check className="w-3 h-3" />}
              </span>
              <span className="capitalize">
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id.replace(/_/g, " ")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Internal: Pagination button ──────────────────────────────── */
function PaginationButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      variant="outline"
      className={cn(
        "w-7 h-7 p-0 rounded-md border-gray-200 transition-all",
        "hover:bg-brand hover:text-white hover:border-brand",
        "disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200",
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
