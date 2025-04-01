
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function UsersPage() {
  const { userData } = useAuth();
  
  // Only managers should access this page
  if (userData?.role !== 'manager') {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the user management page. Here you can view and manage system users.</p>
        </CardContent>
      </Card>
    </div>
  );
}
