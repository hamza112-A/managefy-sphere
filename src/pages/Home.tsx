
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Package, ShoppingCart, ClipboardList, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Welcome to Investify
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Your complete inventory management solution for businesses of all sizes
              </p>
            </div>
            <div className="space-x-4">
              <Button size="lg" onClick={() => navigate('/products')}>
                Browse Products
              </Button>
              {!currentUser ? (
                <Button size="lg" variant="outline" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-4">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Inventory Management</h3>
                <p className="text-muted-foreground">
                  Track stock levels, set alerts, and manage your inventory with ease
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
                <ShoppingCart className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Sales Processing</h3>
                <p className="text-muted-foreground">
                  Process sales quickly and efficiently with our intuitive cart system
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
                <ClipboardList className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Order Management</h3>
                <p className="text-muted-foreground">
                  Keep track of all orders from placement to fulfillment
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Role-Based Access</h3>
                <p className="text-muted-foreground">
                  Manage user permissions with our role-based access control system
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to streamline your inventory?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join Investify today and take control of your business operations
              </p>
            </div>
            {!currentUser ? (
              <Button size="lg" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
