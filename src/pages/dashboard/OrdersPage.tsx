"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOrders } from "@/lib/hooks/useOrders"
import { useAuth } from "@/contexts/AuthContext"
import { Package, ClipboardList, Clock, CheckCircle, Truck, XCircle } from "lucide-react"
import { OrderStatus } from "@/lib/types"
import { format } from "date-fns"

export default function OrdersPage() {
  const { orders, loading, error, updateOrderStatus } = useOrders()
  const { getUserRole } = useAuth()
  const userRole = getUserRole()
  const isManager = userRole === "manager"
  const [activeTab, setActiveTab] = useState<string>("all")

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case OrderStatus.SHIPPED:
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-4 w-4 mr-1" />
      case OrderStatus.PROCESSING:
        return <Package className="h-4 w-4 mr-1" />
      case OrderStatus.SHIPPED:
        return <Truck className="h-4 w-4 mr-1" />
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-4 w-4 mr-1" />
      case OrderStatus.CANCELLED:
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return <ClipboardList className="h-4 w-4 mr-1" />
    }
  }

  const filteredOrders = activeTab === "all" ? orders : orders.filter((order) => order.status === activeTab)

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (isManager) {
      updateOrderStatus(orderId, newStatus)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-40">
              <p>Loading orders...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
              <p className="text-muted-foreground mb-4">
                There was a problem loading your orders. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value={OrderStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={OrderStatus.PROCESSING}>Processing</TabsTrigger>
          <TabsTrigger value={OrderStatus.SHIPPED}>Shipped</TabsTrigger>
          <TabsTrigger value={OrderStatus.DELIVERED}>Delivered</TabsTrigger>
          <TabsTrigger value={OrderStatus.CANCELLED}>Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders found</h2>
              <p className="text-muted-foreground">
                {activeTab === "all" ? "You haven't placed any orders yet." : `You don't have any ${activeTab} orders.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placed on {format(order.createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge className={`flex items-center ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Items</h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted/40 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                              {item.product.imageUrl ? (
                                <img
                                  src={item.product.imageUrl || "/placeholder.svg"}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>

              {isManager && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                <div className="px-6 pb-6">
                  <h3 className="font-medium mb-2">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {order.status !== OrderStatus.PENDING && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, OrderStatus.PENDING)}
                      >
                        Mark as Pending
                      </Button>
                    )}
                    {order.status !== OrderStatus.PROCESSING && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, OrderStatus.PROCESSING)}
                      >
                        Mark as Processing
                      </Button>
                    )}
                    {order.status !== OrderStatus.SHIPPED && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id, OrderStatus.SHIPPED)}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.DELIVERED)}
                    >
                      Mark as Delivered
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.CANCELLED)}
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

