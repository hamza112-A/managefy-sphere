
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AlertsPage() {
  const { userData } = useAuth();
  
  // Only managers should access this page
  if (userData?.role !== 'manager') {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Stock Alerts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the stock alerts page. Here you can view products that are low on stock.</p>
        </CardContent>
      </Card>
    </div>
  );
}
