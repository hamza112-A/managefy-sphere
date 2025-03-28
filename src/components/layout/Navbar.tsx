
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, LogOut, User, LayoutDashboard, Package, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="font-bold text-xl hidden md:inline-block">Investify</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:underline underline-offset-4">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium hover:underline underline-offset-4">
            Products
          </Link>
          {currentUser && (
            <Link to="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {userData?.displayName || currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    Role: {userData?.role || 'user'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/signin')}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
