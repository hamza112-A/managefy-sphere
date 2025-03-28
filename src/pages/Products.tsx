import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, Search, Filter, Package } from 'lucide-react';

export default function Products() {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    addToCart(product);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search products..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button 
            variant={!category ? "default" : "outline"} 
            size="sm"
            onClick={() => setCategory(null)}
            className="whitespace-nowrap"
          >
            All
          </Button>
          {categories.map(cat => (
            <Button 
              key={cat} 
              variant={category === cat ? "default" : "outline"} 
              size="sm"
              onClick={() => setCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground">Try a different search term or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden h-full flex flex-col">
              <div className="aspect-[4/3] bg-muted relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge 
                  className="absolute top-2 right-2" 
                  variant={product.stockQuantity > 0 ? "default" : "destructive"}
                >
                  {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
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
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stockQuantity <= 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
