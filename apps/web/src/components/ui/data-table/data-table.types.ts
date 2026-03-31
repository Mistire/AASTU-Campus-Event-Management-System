import { ReactNode } from "react"

export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex?: keyof T
  width?: string
  align?: "left" | "center" | "right"
  sortable?: boolean
  render?: (value: any, record: T, index: number) => ReactNode
  className?: string
}

export interface TableAction<T = any> {
  key: string
  label: string
  icon?: ReactNode
  onClick: (record: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
}

export interface PaginationConfig {
  current?: number
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  pageSizeOptions?: number[]
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

export interface DataTableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  actions?: TableAction<T>[]
  onRowClick?: (record: T, index: number) => void
  selectedRowKey?: string | number
  selectedRowValue?: any
  loading?: boolean
  emptyText?: string
  className?: string
  rowClassName?: string | ((record: T, index: number) => string)
  showHeader?: boolean
  stickyHeader?: boolean
  hoverable?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedKeys: (string | number)[]) => void
  selectedKeys?: (string | number)[]
  rowKey?: keyof T | ((record: T) => string | number)
  // Pagination props
  pagination?: PaginationConfig | false
  pageSize?: number
  current?: number
  total?: number
}

// Common data types for tables
export interface User {
  id: number
  name: string
  email: string
  role: string
  status: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  inStock: boolean
  rating: number
}

export interface Order {
  id: string
  customerName: string
  items: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  orderDate: string
}

export interface Transaction {
  id: number
  refId: string
  type: "Income" | "Savings" | "Expenses"
  amount: string
  description: string
  date: string
  from: string
  fromIcon: string
  category: string
  status: "Completed" | "Pending" | "Failed"
}
