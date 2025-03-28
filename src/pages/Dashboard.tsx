
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/lib/hooks/useProducts';
import { useOrders } from '@/lib/hooks/useOrders';
import { useCart } from '@/lib/hooks/useCart';
import { Package, ShoppingCart, ClipboardList, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { userData } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const { orders, loading: ordersLoading } = useOrders();
  const { cart, loading: cartLoading } = useCart();
  const isManager = userData?.role === 'manager';

  const lowStockItems = products.filter(product => product.stockQuantity < 10);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Welcome back, {userData?.displayName || 'User'}! Here's an overview of your {isManager ? 'business' : 'account'}.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isManager ? 'Total Products' : 'Available Products'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productsLoading ? '...' : products.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isManager 
                ? `${lowStockItems.length} products low on stock`
                : 'Products available for purchase'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isManager ? 'Total Orders' : 'Your Orders'}
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ordersLoading ? '...' : orders.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isManager 
                ? `${orders.filter(o => o.status === 'pending').length} pending orders` 
                : 'Orders you have placed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Cart Items
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cartLoading ? '...' : cart?.items.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Items in your shopping cart
            </p>
          </CardContent>
        </Card>

        {isManager && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productsLoading ? '...' : lowStockItems.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Products that need restocking
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {!ordersLoading && orders.length > 0 ? (
          orders.slice(0, 5).map(order => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt.toLocaleDateString()} - {order.items.length} items
                    </p>
                  </div>
                  <div>
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-right capitalize">{order.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No recent orders to display.</p>
        )}
      </div>
    </div>
  );
}
