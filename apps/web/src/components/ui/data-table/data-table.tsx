"use client"

import React, { ReactNode, useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DataTableProps, TableColumn, TableAction, PaginationConfig } from "./data-table.types"
import { ColumnTypes } from "./data-table.utils"

// Re-export types and utilities for convenience
export type { DataTableProps, TableColumn, TableAction, PaginationConfig } from "./data-table.types"
export { ColumnTypes, createColumn, BadgeConfigs, CellRenderers, TableConfigs, PaginationConfigs, ActionConfigs } from "./data-table.utils"

export function DataTable<T = any>({
  data,
  columns,
  actions = [],
  onRowClick,
  selectedRowKey,
  selectedRowValue,
  loading = false,
  emptyText = "No data available",
  className,
  rowClassName,
  showHeader = true,
  stickyHeader = false,
  hoverable = true,
  selectable = false,
  onSelectionChange,
  selectedKeys = [],
  rowKey = "id" as keyof T,
  // Pagination props
  pagination = false,
  pageSize = 10,
  current = 1,
  total,
}: DataTableProps<T>) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(current)
  const [pageSizeState, setPageSizeState] = useState(() => {
    // Initialize with pageSize from pagination config if available
    if (typeof pagination === 'object' && pagination.pageSize) {
      return pagination.pageSize
    }
    return pageSize
  })

  // Calculate pagination values
  const paginationConfig: PaginationConfig = typeof pagination === 'object' ? {
    ...pagination,
    current: pagination.current || currentPage,
    pageSize: pageSizeState, // Always use the local state for pageSize
    total: pagination.total || total || data.length,
  } : {
    current: currentPage,
    pageSize: pageSizeState,
    total: total || data.length,
    showSizeChanger: true,
    showQuickJumper: false,
    showTotal: true,
    pageSizeOptions: [5, 10, 20, 50, 100],
  }

  // Ensure all pagination values are numbers
  const safeCurrent = paginationConfig.current || 1
  const safePageSize = paginationConfig.pageSize || pageSizeState || 10
  const safeTotal = paginationConfig.total || data.length

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (pagination === false) return data
    
    const startIndex = (safeCurrent - 1) * safePageSize
    const endIndex = startIndex + safePageSize
    return data.slice(startIndex, endIndex)
  }, [data, safeCurrent, safePageSize, pagination])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    paginationConfig.onChange?.(page, safePageSize)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSizeState(size)
    setCurrentPage(1) // Reset to first page when changing page size
    paginationConfig.onShowSizeChange?.(1, size)
  }

  const totalPages = Math.ceil(safeTotal / safePageSize)
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(record)
    }
    return (record as any)[rowKey] ?? index
  }

  const getRowClassName = (record: T, index: number): string => {
    const baseClasses = "transition-colors"
    const hoverClass = hoverable ? "hover:bg-muted/50" : ""
    const clickableClass = onRowClick ? "cursor-pointer" : ""
    
    let customClass = ""
    if (typeof rowClassName === "function") {
      customClass = rowClassName(record, index)
    } else if (typeof rowClassName === "string") {
      customClass = rowClassName
    }

    const selectedClass = selectedRowValue === getRowKey(record, index) ? "bg-muted/30" : ""

    return cn(baseClasses, hoverClass, clickableClass, customClass, selectedClass)
  }

  const handleRowClick = (record: T, index: number) => {
    if (onRowClick) {
      onRowClick(record, index)
    }
  }

  const renderCellContent = (column: TableColumn<T>, record: T, index: number) => {
    if (column.render) {
      return column.render((record as any)[column.dataIndex!], record, index)
    }

    const value = column.dataIndex ? (record as any)[column.dataIndex] : ""
    
    // Handle different data types
    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    }

    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value)
    }

    return value?.toString() || ""
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table className={className}>
          {showHeader && (
            <TableHeader className={stickyHeader ? "sticky top-0 bg-background z-10" : ""}>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.className
                    )}
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.className
                    )}
                  >
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <div className="h-8 bg-muted animate-pulse rounded" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          {emptyText}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table className={className}>
        {showHeader && (
          <TableHeader className={stickyHeader ? "sticky top-0 bg-background z-10" : ""}>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.title}
                </TableHead>
              ))}
              {actions.length > 0 && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {paginatedData.map((record, index) => (
            <TableRow
              key={getRowKey(record, index)}
              className={getRowClassName(record, index)}
              onClick={() => handleRowClick(record, index)}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.className
                  )}
                >
                  {renderCellContent(column, record, index)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {actions.map((action) => (
                      <Button
                        key={action.key}
                        variant={action.variant || "ghost"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          action.onClick(record)
                        }}
                        className={cn("h-8 px-2", action.className)}
                      >
                        {action.icon && <span className="mr-1">{action.icon}</span>}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      {pagination !== false && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center gap-2">
            {paginationConfig.showTotal && (
              <span className="text-sm text-muted-foreground">
                Showing {((safeCurrent - 1) * safePageSize) + 1} to{" "}
                {Math.min(safeCurrent * safePageSize, safeTotal)} of{" "}
                {safeTotal} entries
              </span>
            )}
            {paginationConfig.showSizeChanger && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={safePageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paginationConfig.pageSizeOptions?.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={safeCurrent === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(safeCurrent - 1)}
              disabled={safeCurrent === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, safeCurrent - 2)) + i
                if (pageNum > totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={safeCurrent === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(safeCurrent + 1)}
              disabled={safeCurrent === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrent === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
