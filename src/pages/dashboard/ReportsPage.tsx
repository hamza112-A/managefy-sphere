"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useProducts } from "@/lib/hooks/useProducts"
import { useOrders } from "@/lib/hooks/useOrders"
import { Navigate } from "react-router-dom"
import { BarChart, PieChart, LineChart, Download, RefreshCw } from "lucide-react"
import { OrderStatus } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function ReportsPage() {
  const { userData } = useAuth()
  const { products } = useProducts()
  const { orders } = useOrders()
  const [activeTab, setActiveTab] = useState("sales")
  const [refreshing, setRefreshing] = useState(false)

  // Only managers should access this page
  if (userData?.role !== "manager") {
    return <Navigate to="/dashboard" />
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success("Reports refreshed")
    }, 1000)
  }

  // Replace the handleExport function with this implementation
  const handleExport = () => {
    try {
      let csvContent = ""
      let filename = ""

      // Generate different CSV content based on the active tab
      if (activeTab === "sales") {
        filename = "sales-report.csv"
        csvContent = "Category,Sales Amount\n"
        Object.entries(salesByCategory).forEach(([category, amount]) => {
          csvContent += `"${category}",${amount.toFixed(2)}\n`
        })
      } else if (activeTab === "inventory") {
        filename = "inventory-report.csv"
        csvContent = "Product Name,Category,Stock Quantity\n"
        products.slice(0, 20).forEach((product) => {
          csvContent += `"${product.name}","${product.category}",${product.stockQuantity}\n`
        })
      } else if (activeTab === "orders") {
        filename = "orders-report.csv"
        csvContent = "Order ID,Date,Status,Items,Total\n"
        orders.slice(0, 20).forEach((order) => {
          csvContent += `"${order.id.slice(0, 8)}","${order.createdAt.toLocaleDateString()}","${order.status}",${order.items.length},${order.total.toFixed(2)}\n`
        })
      }

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

      // Create a download link and trigger the download
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`${filename} downloaded successfully`)
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    }
  }

  // Safely calculate sales by category
  const salesByCategory: Record<string, number> = {}
  try {
    products.forEach((product) => {
      const category = product.category
      if (!salesByCategory[category]) {
        salesByCategory[category] = 0
      }

      // Find orders containing this product
      orders.forEach((order) => {
        const orderItem = order.items.find((item) => item.productId === product.id)
        if (orderItem) {
          salesByCategory[category] += orderItem.price * orderItem.quantity
        }
      })
    })
  } catch (error) {
    console.error("Error calculating sales by category:", error)
  }

  // Safely calculate order status distribution
  const orderStatusDistribution: Record<string, number> = {}
  try {
    orders.forEach((order) => {
      if (!orderStatusDistribution[order.status]) {
        orderStatusDistribution[order.status] = 0
      }
      orderStatusDistribution[order.status]++
    })
  } catch (error) {
    console.error("Error calculating order status distribution:", error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Business Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
          <TabsTrigger value="orders">Orders Report</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Sales by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  {Object.keys(salesByCategory).length === 0 ? (
                    <p className="text-muted-foreground">No sales data available</p>
                  ) : (
                    <div className="w-full">
                      {Object.entries(salesByCategory).map(([category, amount]) => {
                        const maxValue = Math.max(...Object.values(salesByCategory)) || 1
                        return (
                          <div key={category} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{category}</span>
                              <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{
                                  width: `${Math.min(100, (amount / maxValue) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  {Object.keys(orderStatusDistribution).length === 0 ? (
                    <p className="text-muted-foreground">No order data available</p>
                  ) : (
                    <div className="w-full">
                      {Object.entries(orderStatusDistribution).map(([status, count]) => {
                        const maxValue = Math.max(...Object.values(orderStatusDistribution)) || 1
                        return (
                          <div key={status} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{status}</span>
                              <span className="text-sm font-medium">{count} orders</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  status === OrderStatus.DELIVERED
                                    ? "bg-green-500"
                                    : status === OrderStatus.SHIPPED
                                      ? "bg-blue-500"
                                      : status === OrderStatus.PROCESSING
                                        ? "bg-yellow-500"
                                        : status === OrderStatus.CANCELLED
                                          ? "bg-red-500"
                                          : "bg-primary"
                                }`}
                                style={{
                                  width: `${(count / maxValue) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                {products.length === 0 ? (
                  <p className="text-muted-foreground">No inventory data available</p>
                ) : (
                  <div className="w-full">
                    {products.slice(0, 10).map((product) => (
                      <div key={product.id} className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{product.name}</span>
                          <span className="text-sm font-medium">{product.stockQuantity} units</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              product.stockQuantity > 50
                                ? "bg-green-500"
                                : product.stockQuantity > 20
                                  ? "bg-blue-500"
                                  : product.stockQuantity > 10
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(100, (product.stockQuantity / 100) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                {orders.length === 0 ? (
                  <p className="text-muted-foreground">No order data available</p>
                ) : (
                  <div className="w-full">
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {order.createdAt.toLocaleDateString()} - {order.items.length} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.total.toFixed(2)}</p>
                            <Badge className="capitalize">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

