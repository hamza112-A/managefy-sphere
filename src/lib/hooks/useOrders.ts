"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"
import { type Order, OrderStatus, type Product, type OrderItem } from "@/lib/types"
import { useCart } from "./useCart"
import { toast } from "sonner"

// Define types for Firestore document data
interface OrderData {
  userId: string
  items: Array<{
    id: string
    productId: string
    quantity: number
    price: number
  }>
  total: number
  status: OrderStatus
  createdAt: any // Firestore timestamp
  updatedAt: any // Firestore timestamp
}

interface ProductData {
  name: string
  description: string
  price: number
  stockQuantity: number
  category: string
  imageUrl?: string
  createdAt: any // Firestore timestamp
  updatedAt: any // Firestore timestamp
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { currentUser, getUserRole } = useAuth()
  const { cart, clearCart } = useCart()
  const userRole = getUserRole()

  const fetchOrders = async () => {
    if (!currentUser) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const ordersRef = collection(db, "orders")
      let q

      // Managers can see all orders, users can only see their own
      if (userRole === "manager") {
        q = query(ordersRef, orderBy("createdAt", "desc"))
      } else {
        // Temporary workaround until the index is built
        // Just filter by userId without ordering
        q = query(
          ordersRef,
          where("userId", "==", currentUser.uid),
          // orderBy removed temporarily
        )
      }

      const querySnapshot = await getDocs(q)

      const fetchedOrders: Order[] = []
      for (const orderDoc of querySnapshot.docs) {
        try {
          const orderData = orderDoc.data() as OrderData

          // Fetch product details for each order item
          const itemsWithProducts: OrderItem[] = []
          for (const item of orderData.items || []) {
            try {
              const productDoc = await getDoc(doc(db, "products", item.productId))
              if (productDoc.exists()) {
                const productData = productDoc.data() as ProductData

                const product: Product = {
                  id: productDoc.id,
                  name: productData.name,
                  description: productData.description,
                  price: productData.price,
                  stockQuantity: productData.stockQuantity,
                  category: productData.category,
                  imageUrl: productData.imageUrl,
                  createdAt: productData.createdAt?.toDate() || new Date(),
                  updatedAt: productData.updatedAt?.toDate() || new Date(),
                }

                itemsWithProducts.push({
                  ...item,
                  product,
                })
              } else {
                // Handle case where product doesn't exist anymore
                itemsWithProducts.push({
                  ...item,
                  product: {
                    id: item.productId,
                    name: "Product no longer available",
                    description: "This product has been removed from the catalog",
                    price: item.price,
                    stockQuantity: 0,
                    category: "Unknown",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                })
              }
            } catch (itemError) {
              console.error("Error fetching product details for order item:", itemError)
              // Continue with next item
            }
          }

          fetchedOrders.push({
            id: orderDoc.id,
            userId: orderData.userId,
            items: itemsWithProducts,
            total: orderData.total,
            status: orderData.status,
            createdAt: orderData.createdAt?.toDate() || new Date(),
            updatedAt: orderData.updatedAt?.toDate() || new Date(),
          })
        } catch (orderError) {
          console.error("Error processing order document:", orderError)
          // Continue with next order
        }
      }

      // If we're using the workaround, sort the orders manually after fetching
      if (userRole !== "manager") {
        fetchedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }

      setOrders(fetchedOrders)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err instanceof Error ? err : new Error("Failed to load orders"))
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const getOrder = async (id: string): Promise<Order | null> => {
    try {
      const orderDoc = await getDoc(doc(db, "orders", id))
      if (!orderDoc.exists()) {
        return null
      }

      const orderData = orderDoc.data() as OrderData

      // Check permission
      if (userRole !== "manager" && orderData.userId !== currentUser?.uid) {
        toast.error("You do not have permission to view this order")
        return null
      }

      // Fetch product details for each order item
      const itemsWithProducts: OrderItem[] = []
      for (const item of orderData.items || []) {
        const productDoc = await getDoc(doc(db, "products", item.productId))
        if (productDoc.exists()) {
          const productData = productDoc.data() as ProductData
          const product: Product = {
            id: productDoc.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stockQuantity: productData.stockQuantity,
            category: productData.category,
            imageUrl: productData.imageUrl,
            createdAt: productData.createdAt.toDate(),
            updatedAt: productData.updatedAt.toDate(),
          }

          itemsWithProducts.push({
            ...item,
            product,
          })
        }
      }

      return {
        id: orderDoc.id,
        userId: orderData.userId,
        items: itemsWithProducts,
        total: orderData.total,
        status: orderData.status,
        createdAt: orderData.createdAt.toDate(),
        updatedAt: orderData.updatedAt.toDate(),
      }
    } catch (err) {
      console.error("Error getting order:", err)
      toast.error("Failed to get order details")
      throw err
    }
  }

  const createOrder = async (): Promise<Order | null> => {
    if (!currentUser) {
      toast.error("Please sign in to place an order")
      return null
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty")
      return null
    }

    try {
      // Check stock availability for each item
      for (const item of cart.items) {
        const productDoc = await getDoc(doc(db, "products", item.productId))
        if (!productDoc.exists()) {
          toast.error(`Product ${item.product.name} no longer exists`)
          return null
        }

        const productData = productDoc.data() as ProductData
        if (productData.stockQuantity < item.quantity) {
          toast.error(`Not enough ${item.product.name} in stock`)
          return null
        }
      }

      // Create the order
      const now = new Date()
      const orderData = {
        userId: currentUser.uid,
        items: cart.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total: cart.total,
        status: OrderStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      }

      const orderDocRef = await addDoc(collection(db, "orders"), orderData)

      // Update stock quantities
      for (const item of cart.items) {
        const productRef = doc(db, "products", item.productId)
        const productDoc = await getDoc(productRef)
        const productData = productDoc.data() as ProductData

        await updateDoc(productRef, {
          stockQuantity: productData.stockQuantity - item.quantity,
          updatedAt: now,
        })
      }

      // Clear the cart
      await clearCart()

      // Add the new order to the state
      const newOrder: Order = {
        id: orderDocRef.id,
        ...orderData,
        items: cart.items,
      }

      setOrders((prev) => [newOrder, ...prev])

      toast.success("Order placed successfully")
      return newOrder
    } catch (err) {
      console.error("Error creating order:", err)
      toast.error("Failed to place order")
      return null
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    if (userRole !== "manager") {
      toast.error("Only managers can update order status")
      return
    }

    try {
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date(),
      })

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status, updatedAt: new Date() } : order)),
      )

      toast.success(`Order status updated to ${status}`)
    } catch (err) {
      console.error("Error updating order status:", err)
      toast.error("Failed to update order status")
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchOrders()
    } else {
      setOrders([])
      setLoading(false)
    }
  }, [currentUser])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
  }
}

