
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ReportsPage() {
  const { userData } = useAuth();
  
  // Only managers should access this page
  if (userData?.role !== 'manager') {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Business Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the reports page. Here you can view business analytics and reports.</p>
        </CardContent>
      </Card>
    </div>
  );
}
