// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stockQuantity: number
  category: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  total: number
  createdAt: Date
  updatedAt: Date
}

// Order types
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

// User types
export type UserRole = "general" | "user" | "manager"

export interface User {
  id: string
  email: string
  displayName: string
  role: UserRole
  isAdmin?: boolean // Added to identify the special manager with promotion rights
  createdAt: Date
  updatedAt: Date
}

