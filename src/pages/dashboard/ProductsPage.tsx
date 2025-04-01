
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <Card>
        <CardHeader>
          <CardTitle>Products Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the products management page. Here you can view and manage all products.</p>
        </CardContent>
      </Card>
    </div>
  );
}
