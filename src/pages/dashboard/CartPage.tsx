
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CartPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cart</h1>
      <Card>
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is your shopping cart. Here you can view and manage your cart items.</p>
        </CardContent>
      </Card>
    </div>
  );
}
