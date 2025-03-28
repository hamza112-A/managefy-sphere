
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getUserRole } = useAuth();
  const userRole = getUserRole();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(query(productsRef, orderBy('createdAt', 'desc')));
      
      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stockQuantity: data.stockQuantity,
          category: data.category,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      
      setProducts(fetchedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    try {
      const productDoc = await getDoc(doc(db, 'products', id));
      if (productDoc.exists()) {
        const data = productDoc.data();
        return {
          id: productDoc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stockQuantity: data.stockQuantity,
          category: data.category,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      }
      return null;
    } catch (err) {
      console.error('Error getting product:', err);
      toast.error('Failed to get product details');
      throw err;
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    if (userRole !== 'manager') {
      toast.error('Only managers can add products');
      throw new Error('Permission denied: Only managers can add products');
    }
    
    try {
      const now = new Date();
      const newProduct = {
        ...product,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      
      const addedProduct: Product = {
        id: docRef.id,
        ...product,
        createdAt: now,
        updatedAt: now,
      };
      
      setProducts((prev) => [addedProduct, ...prev]);
      toast.success('Product added successfully');
      return addedProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> => {
    if (userRole !== 'manager') {
      toast.error('Only managers can update products');
      throw new Error('Permission denied: Only managers can update products');
    }
    
    try {
      const productRef = doc(db, 'products', id);
      const updates_with_timestamp = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await updateDoc(productRef, updates_with_timestamp);
      
      const updatedProduct = await getProduct(id);
      if (!updatedProduct) throw new Error('Product not found after update');
      
      setProducts((prev) => 
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      
      toast.success('Product updated successfully');
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (userRole !== 'manager') {
      toast.error('Only managers can delete products');
      throw new Error('Permission denied: Only managers can delete products');
    }
    
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
      throw err;
    }
  };

  const getLowStockProducts = async (threshold: number = 10): Promise<Product[]> => {
    if (userRole !== 'manager') {
      toast.error('Only managers can view stock alerts');
      throw new Error('Permission denied: Only managers can view stock alerts');
    }
    
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('stockQuantity', '<', threshold));
      const querySnapshot = await getDocs(q);
      
      const lowStockProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lowStockProducts.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stockQuantity: data.stockQuantity,
          category: data.category,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
      
      return lowStockProducts;
    } catch (err) {
      console.error('Error fetching low stock products:', err);
      toast.error('Failed to load stock alerts');
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
  };
}
