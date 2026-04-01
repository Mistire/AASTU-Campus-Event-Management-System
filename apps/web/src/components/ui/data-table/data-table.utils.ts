import { TableColumn } from "./data-table.types"

// Utility function to create common column configurations
export const createColumn = <T = unknown>(
  key: string,
  title: string,
  options: Partial<TableColumn<T>> = {}
): TableColumn<T> => ({
  key,
  title,
  dataIndex: key as keyof T,
  ...options,
})

// Common column types
export const ColumnTypes = {
  text: <T = unknown>(key: string, title: string, options: Partial<TableColumn<T>> = {}) =>
    createColumn<T>(key, title, options),
  
  number: <T = unknown>(key: string, title: string, options: Partial<TableColumn<T>> = {}) =>
    createColumn<T>(key, title, { align: "right", ...options }),
  
  date: <T = unknown>(key: string, title: string, options: Partial<TableColumn<T>> = {}) =>
    createColumn<T>(key, title, { align: "center", ...options }),
  
  boolean: <T = unknown>(key: string, title: string, options: Partial<TableColumn<T>> = {}) =>
    createColumn<T>(key, title, { align: "center", ...options }),
  
  badge: <T = unknown>(key: string, title: string, options: Partial<TableColumn<T>> = {}) =>
    createColumn<T>(key, title, { align: "center", ...options }),
  
  actions: <T = unknown>(key: string, title: string, options: Partial<TableColumn<T>> = {}) =>
    createColumn<T>(key, title, { align: "center", width: "100px", ...options }),
}

// Common badge configurations (Unified brand light-blue theme)
export const BadgeConfigs = {
  status: {
    active: { className: "bg-(--color-brand-subtle) text-(--color-brand) border-(--color-brand)/10", label: "Active" },
    inactive: { className: "bg-gray-50 text-gray-400 border-gray-100", label: "Inactive" },
    pending: { className: "bg-(--color-brand-subtle) text-(--color-brand) border-(--color-brand)/10 opacity-80", label: "Pending" },
    completed: { className: "bg-(--color-brand) text-white border-transparent", label: "Completed" },
    cancelled: { className: "bg-gray-100 text-gray-500 border-gray-200 line-through", label: "Cancelled" },
  },
  
  transaction: {
    Income: { className: "border-(--color-brand)/30 text-(--color-brand) bg-(--color-brand-subtle)", label: "Income" },
    Savings: { className: "border-(--color-brand) text-(--color-brand) bg-(--color-brand-subtle)", label: "Savings" },
    Expenses: { className: "border-gray-200 text-gray-500 bg-gray-50", label: "Expenses" },
  },
  
  order: {
    pending: { className: "bg-(--color-brand-subtle) text-(--color-brand) opacity-70", label: "Pending" },
    processing: { className: "bg-(--color-brand-subtle) text-(--color-brand) font-semibold", label: "Processing" },
    shipped: { className: "bg-(--color-brand-subtle) text-(--color-brand) border-(--color-brand)/20", label: "Shipped" },
    delivered: { className: "bg-(--color-brand) text-white", label: "Delivered" },
    cancelled: { className: "bg-gray-100 text-gray-400 font-normal", label: "Cancelled" },
  },
  
  category: {
    Electronics: { className: "bg-(--color-brand-subtle) text-(--color-brand)", label: "Electronics" },
    Clothing: { className: "bg-(--color-brand-subtle) text-(--color-brand) opacity-90", label: "Clothing" },
    Books: { className: "bg-(--color-brand-subtle) text-(--color-brand) font-medium", label: "Books" },
    Food: { className: "bg-(--color-brand-subtle) text-(--color-brand) border-(--color-brand)/5", label: "Food" },
    Sports: { className: "bg-(--color-brand) text-white", label: "Sports" },
  },
  
  ticket: {
    priority: {
      CRITICAL: { className: "border-(--color-brand) text-(--color-brand) bg-(--color-brand-subtle) font-bold shadow-sm shadow-(--color-brand)/5", label: "CRITICAL" },
      HIGH: { className: "border-(--color-brand)/40 text-(--color-brand) bg-(--color-brand-subtle) font-semibold", label: "HIGH" },
      MEDIUM: { className: "border-(--color-brand)/20 text-(--color-brand) bg-(--color-brand-subtle)", label: "MEDIUM" },
      LOW: { className: "border-gray-100 text-gray-400 bg-gray-50", label: "LOW" },
    },
    status: {
      OPEN: { className: "border-(--color-brand) text-(--color-brand) bg-(--color-brand-subtle)", label: "OPEN" },
      IN_PROGRESS: { className: "border-(--color-brand)/40 text-(--color-brand) bg-(--color-brand-subtle)", label: "IN PROGRESS" },
      RESOLVED: { className: "bg-(--color-brand) text-white border-transparent", label: "RESOLVED" },
      CLOSED: { className: "border-gray-300 text-gray-400 bg-gray-50", label: "CLOSED" },
    },
    category: {
      TECHNICAL: { className: "border-(--color-brand) text-(--color-brand) bg-(--color-brand-subtle)", label: "TECHNICAL" },
      FINANCIAL: { className: "border-(--color-brand)/20 text-(--color-brand) bg-(--color-brand-subtle)", label: "FINANCIAL" },
      GENERAL_INQUIRY: { className: "border-gray-100 text-gray-400 bg-gray-50", label: "GENERAL INQUIRY" },
    },
  },
}


// Common cell renderers
export const CellRenderers = {
  // Format currency
  currency: (value: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value)
  },
  
  // Format date
  date: (value: string | Date) => {
    const date = new Date(value)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },
  
  // Format date with time
  dateTime: (value: string | Date) => {
    const date = new Date(value)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  },
  
  // Format number with commas
  number: (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  },
  
  // Format percentage
  percentage: (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  },
  
  // Truncate text
  truncate: (value: string, maxLength = 50) => {
    if (value.length <= maxLength) return value
    return `${value.substring(0, maxLength)}...`
  },
  
  // Render avatar
  avatar: (src: string | null, fallback: string) => {
    return src || fallback
  },
  
  // Render rating stars
  rating: (rating: number, maxRating = 5) => {
    return "⭐".repeat(Math.floor(rating)) + "☆".repeat(maxRating - Math.floor(rating))
  },
}

// Common table configurations
export const TableConfigs = {
  default: {
    hoverable: true,
    showHeader: true,
    stickyHeader: false,
    emptyText: "No data available",
  },
  
  compact: {
    hoverable: false,
    showHeader: true,
    stickyHeader: false,
    emptyText: "No data available",
  },
  
  detailed: {
    hoverable: true,
    showHeader: true,
    stickyHeader: true,
    emptyText: "No data available",
  },
}

// Pagination configurations
export const PaginationConfigs = {
  default: {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: false,
    showTotal: true,
    pageSizeOptions: [5, 10, 20, 50, 100],
  },
  
  compact: {
    pageSize: 5,
    showSizeChanger: false,
    showQuickJumper: false,
    showTotal: false,
    pageSizeOptions: [5, 10, 20],
  },
  
  detailed: {
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
    pageSizeOptions: [10, 20, 50, 100, 200],
  },
}

// Common action button configurations
export const ActionConfigs = {
  edit: {
    key: "edit",
    label: "Edit",
    variant: "outline" as const,
  },
  
  delete: {
    key: "delete",
    label: "Delete",
    variant: "destructive" as const,
  },
  
  view: {
    key: "view",
    label: "View",
    variant: "ghost" as const,
  },
  
  download: {
    key: "download",
    label: "Download",
    variant: "ghost" as const,
  },
}
