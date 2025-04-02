"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/hooks/useCart"
import { useOrders } from "@/lib/hooks/useOrders"
import { Package, Trash2, Plus, Minus, ShoppingCart, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import type { CartItem } from "@/lib/types"

export default function CartPage() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart()
  const { createOrder } = useOrders()
  const navigate = useNavigate()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id)
    } else if (newQuantity <= item.product.stockQuantity) {
      updateCartItem(item.id, newQuantity)
    } else {
      toast.error(`Only ${item.product.stockQuantity} units available in stock`)
    }
  }

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    try {
      setIsCheckingOut(true)
      const order = await createOrder()
      if (order) {
        toast.success("Order placed successfully!")
        navigate("/dashboard/orders")
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      toast.error("Failed to place order")
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <p>Loading your cart...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-60 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">Add some products to your cart to see them here.</p>
              <Button onClick={() => navigate("/products")}>Browse Products</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="outline" onClick={() => clearCart()} disabled={isCheckingOut}>
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items ({cart.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.items.map((item) => (
                <div key={item.id} className="mb-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.product.category}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 min-w-[2rem] text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>

                      {item.quantity >= item.product.stockQuantity && (
                        <div className="flex items-center mt-2 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Maximum stock reached
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(cart.total * 0.1).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(cart.total * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? "Processing..." : "Checkout"}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

