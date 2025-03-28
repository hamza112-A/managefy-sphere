import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Cart, CartItem, Product } from '@/lib/types';
import { toast } from 'sonner';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser, getUserRole } = useAuth();
  const userRole = getUserRole();

  const fetchCart = async () => {
    if (!currentUser) {
      setCart(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Check if the user has a cart
      const cartsRef = collection(db, 'carts');
      const q = query(cartsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create a new cart if none exists
        const newCart: Omit<Cart, 'id'> = {
          userId: currentUser.uid,
          items: [],
          total: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const cartDocRef = doc(collection(db, 'carts'));
        await setDoc(cartDocRef, newCart);
        
        setCart({
          id: cartDocRef.id,
          ...newCart,
        });
      } else {
        // Use the existing cart
        const cartDoc = querySnapshot.docs[0];
        const cartData = cartDoc.data();
        
        // Fetch product details for each cart item
        const itemsWithProducts: CartItem[] = [];
        for (const item of cartData.items || []) {
          const productDoc = await getDoc(doc(db, 'products', item.productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();
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
            };
            
            itemsWithProducts.push({
              ...item,
              product,
            });
          }
        }
        
        setCart({
          id: cartDoc.id,
          userId: cartData.userId,
          items: itemsWithProducts,
          total: cartData.total,
          createdAt: cartData.createdAt.toDate(),
          updatedAt: cartData.updatedAt.toDate(),
        });
      }
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError(err);
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!currentUser) {
      toast.error('Please sign in to add items to your cart');
      return;
    }

    if (product.stockQuantity < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    try {
      await fetchCart(); // Make sure we have the latest cart
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      const cartRef = doc(db, 'carts', cart.id);
      const existingItemIndex = cart.items.findIndex(item => item.productId === product.id);
      
      let updatedItems = [...cart.items];
      let newTotal = cart.total;
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const existingItem = cart.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        if (product.stockQuantity < newQuantity) {
          toast.error('Not enough stock available');
          return;
        }
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
        
        newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now().toString(), // Generate a temporary ID
          productId: product.id,
          product, // Include full product details for the UI
          quantity,
          price: product.price,
        };
        
        updatedItems.push(newItem);
        newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      // Update the cart in Firestore
      await updateDoc(cartRef, {
        items: updatedItems.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })), // Only save the necessary data
        total: newTotal,
        updatedAt: new Date(),
      });
      
      // Update the local state
      setCart({
        ...cart,
        items: updatedItems,
        total: newTotal,
        updatedAt: new Date(),
      });
      
      toast.success(`Added ${product.name} to cart`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add item to cart');
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!currentUser || !cart) {
      toast.error('Please sign in to update your cart');
      return;
    }

    try {
      const itemIndex = cart.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        toast.error('Item not found in cart');
        return;
      }
      
      const item = cart.items[itemIndex];
      
      // Check if we have enough stock
      if (quantity > item.product.stockQuantity) {
        toast.error('Not enough stock available');
        return;
      }
      
      // Create updated items array
      const updatedItems = [...cart.items];
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        updatedItems.splice(itemIndex, 1);
      } else {
        // Update the quantity
        updatedItems[itemIndex] = {
          ...item,
          quantity,
        };
      }
      
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Update the cart in Firestore
      const cartRef = doc(db, 'carts', cart.id);
      await updateDoc(cartRef, {
        items: updatedItems.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total: newTotal,
        updatedAt: new Date(),
      });
      
      // Update the local state
      setCart({
        ...cart,
        items: updatedItems,
        total: newTotal,
        updatedAt: new Date(),
      });
      
      toast.success('Cart updated successfully');
    } catch (err) {
      console.error('Error updating cart:', err);
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!currentUser || !cart) {
      toast.error('Please sign in to update your cart');
      return;
    }

    try {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Update the cart in Firestore
      const cartRef = doc(db, 'carts', cart.id);
      await updateDoc(cartRef, {
        items: updatedItems.map(item => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total: newTotal,
        updatedAt: new Date(),
      });
      
      // Update the local state
      setCart({
        ...cart,
        items: updatedItems,
        total: newTotal,
        updatedAt: new Date(),
      });
      
      toast.success('Item removed from cart');
    } catch (err) {
      console.error('Error removing from cart:', err);
      toast.error('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    if (!currentUser || !cart) {
      return;
    }

    try {
      const cartRef = doc(db, 'carts', cart.id);
      await updateDoc(cartRef, {
        items: [],
        total: 0,
        updatedAt: new Date(),
      });
      
      setCart({
        ...cart,
        items: [],
        total: 0,
        updatedAt: new Date(),
      });
      
      toast.success('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast.error('Failed to clear cart');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [currentUser]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };
}
