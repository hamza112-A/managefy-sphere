
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the orders management page. Here you can view and manage all orders.</p>
        </CardContent>
      </Card>
    </div>
  );
}
