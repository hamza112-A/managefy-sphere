"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useProducts } from "@/lib/hooks/useProducts"
import { Navigate } from "react-router-dom"
import { Package, Search, AlertTriangle, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

export default function InventoryPage() {
  const { userData } = useAuth()
  const { products, loading, updateProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<"name" | "stockQuantity" | "category">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Only managers should access this page
  if (userData?.role !== "manager") {
    return <Navigate to="/dashboard" />
  }

  const handleSort = (field: "name" | "stockQuantity" | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleUpdateStock = async (productId: string, currentStock: number, newStock: number) => {
    if (newStock < 0) {
      toast.error("Stock quantity cannot be negative")
      return
    }

    try {
      await updateProduct(productId, { stockQuantity: newStock })
      toast.success("Stock updated successfully")
    } catch (error) {
      console.error("Error updating stock:", error)
      toast.error("Failed to update stock")
    }
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortField === "category") {
        return sortDirection === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
      } else {
        return sortDirection === "asc" ? a.stockQuantity - b.stockQuantity : b.stockQuantity - a.stockQuantity
      }
    })

  const lowStockProducts = products.filter((product) => product.stockQuantity < 10)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Low Stock Alert</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  {lowStockProducts.length} products are running low on stock and need attention.
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map((product) => (
                    <Badge
                      key={product.id}
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                    >
                      {product.name}: {product.stockQuantity} left
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>Inventory Items</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading inventory data...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or add some products</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("name")}>
                        Product Name
                        {sortField === "name" && (
                          <ArrowUpDown
                            className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-0" : "rotate-180"}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("category")}>
                        Category
                        {sortField === "category" && (
                          <ArrowUpDown
                            className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-0" : "rotate-180"}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("stockQuantity")}>
                        Stock
                        {sortField === "stockQuantity" && (
                          <ArrowUpDown
                            className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-0" : "rotate-180"}`}
                          />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge
                            variant={product.stockQuantity > 10 ? "outline" : "destructive"}
                            className={product.stockQuantity > 10 ? "bg-green-50" : ""}
                          >
                            {product.stockQuantity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStock(product.id, product.stockQuantity, product.stockQuantity - 1)
                            }
                            disabled={product.stockQuantity <= 0}
                          >
                            -
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStock(product.id, product.stockQuantity, product.stockQuantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

