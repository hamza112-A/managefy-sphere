"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddProductForm } from "@/components/products/AddProductForm"
import { ProductList } from "@/components/products/ProductList"
import { EditProductForm } from "@/components/products/EditProductForm"
import { useAuth } from "@/contexts/AuthContext"
import type { Product } from "@/lib/types"
import { Plus, List } from "lucide-react"

export default function ProductsPage() {
  const { userData } = useAuth()
  const isManager = userData?.role === "manager"
  const [activeTab, setActiveTab] = useState("list")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setActiveTab("edit")
  }

  const handleAddSuccess = () => {
    setActiveTab("list")
  }

  const handleEditSuccess = () => {
    setEditingProduct(null)
    setActiveTab("list")
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setActiveTab("list")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        {isManager && activeTab === "list" && (
          <Button onClick={() => setActiveTab("add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Product List
          </TabsTrigger>
          {isManager && (
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ProductList onEdit={isManager ? handleEditProduct : undefined} />
        </TabsContent>

        {isManager && (
          <>
            <TabsContent value="add" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddProductForm onSuccess={handleAddSuccess} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit" className="mt-6">
              {editingProduct && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Product: {editingProduct.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditProductForm
                      product={editingProduct}
                      onSuccess={handleEditSuccess}
                      onCancel={handleCancelEdit}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

