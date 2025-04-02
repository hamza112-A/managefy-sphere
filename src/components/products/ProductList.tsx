"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProducts } from "@/lib/hooks/useProducts"
import { useCart } from "@/lib/hooks/useCart"
import { ShoppingCart, Package, Edit, Trash2 } from "lucide-react"
import type { Product } from "@/lib/types"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface ProductListProps {
  onEdit?: (product: Product) => void
}

export function ProductList({ onEdit }: ProductListProps) {
  const { products, loading, deleteProduct } = useProducts()
  const { addToCart } = useCart()
  const { getUserRole } = useAuth()
  const userRole = getUserRole()
  const isManager = userRole === "manager"

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id)
        toast.success(`Product "${name}" deleted successfully`)
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-muted-foreground">Add some products to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden h-full flex flex-col">
          <div className="aspect-[4/3] bg-muted relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <Badge className="absolute top-2 right-2" variant={product.stockQuantity > 0 ? "default" : "destructive"}>
              {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span>{product.name}</span>
              <span className="text-primary">${product.price.toFixed(2)}</span>
            </CardTitle>
            <Badge variant="outline" className="w-fit">
              {product.category}
            </Badge>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground line-clamp-3">{product.description}</p>
            <p className="text-sm mt-2">Stock: {product.stockQuantity} units</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => addToCart(product)} disabled={product.stockQuantity <= 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>

            {isManager && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => onEdit && onEdit(product)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleDelete(product.id, product.name)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

