"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useProducts } from "@/lib/hooks/useProducts"
import { Navigate, useNavigate } from "react-router-dom"
import { Package, ArrowRight, RefreshCw } from "lucide-react"
import type { Product } from "@/lib/types"

export default function AlertsPage() {
  const { userData } = useAuth()
  const { products, loading } = useProducts()
  const [lowStockThreshold, setLowStockThreshold] = useState(10)
  const [refreshing, setRefreshing] = useState(false)
  const navigate = useNavigate()

  // Only managers should access this page
  if (userData?.role !== "manager") {
    return <Navigate to="/dashboard" />
  }

  const lowStockProducts = products.filter((product) => product.stockQuantity < lowStockThreshold)
  const outOfStockProducts = products.filter((product) => product.stockQuantity === 0)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { label: "Out of Stock", color: "destructive" }
    } else if (product.stockQuantity < 5) {
      return { label: "Critical", color: "destructive" }
    } else if (product.stockQuantity < lowStockThreshold) {
      return { label: "Low", color: "warning" }
    } else {
      return { label: "Good", color: "success" }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Alerts</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-40">
              <p>Loading stock data...</p>
            </div>
          </CardContent>
        </Card>
      ) : lowStockProducts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <Package className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">All Stock Levels are Good</h2>
              <p className="text-muted-foreground">
                There are no products below the threshold of {lowStockThreshold} units.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => {
                const status = getStockStatus(product)
                return (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={status.color as any}>{status.label}</Badge>
                      <div className="text-right">
                        <div className="font-bold">{product.stockQuantity}</div>
                        <div className="text-xs text-muted-foreground">units left</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/inventory")}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

