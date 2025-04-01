
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Users, 
  AlertTriangle, 
  BarChart, 
  Settings 
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: UserRole[];
}

export default function DashboardSidebar() {
  const { pathname } = useLocation();
  const { userData, getUserRole } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('user');
  
  // Update user role whenever userData changes
  useEffect(() => {
    const role = getUserRole();
    console.log('Dashboard sidebar - getUserRole returned:', role);
    console.log('Dashboard sidebar - User data:', userData);
    setUserRole(role);
  }, [userData, getUserRole]);

  const links: SidebarLink[] = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['user', 'manager'],
    },
    {
      title: 'Products',
      href: '/dashboard/products',
      icon: Package,
      roles: ['user', 'manager'],
    },
    {
      title: 'Cart',
      href: '/dashboard/cart',
      icon: ShoppingCart,
      roles: ['user', 'manager'],
    },
    {
      title: 'Orders',
      href: '/dashboard/orders',
      icon: ClipboardList,
      roles: ['user', 'manager'],
    },
    {
      title: 'Inventory',
      href: '/dashboard/inventory',
      icon: Package,
      roles: ['manager'],
    },
    {
      title: 'User Management',
      href: '/dashboard/users',
      icon: Users,
      roles: ['manager'],
    },
    {
      title: 'Stock Alerts',
      href: '/dashboard/alerts',
      icon: AlertTriangle,
      roles: ['manager'],
    },
    {
      title: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart,
      roles: ['manager'],
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['user', 'manager'],
    },
  ];

  // Filter links based on user role
  const filteredLinks = links.filter(link => 
    link.roles.includes(userRole as UserRole)
  );

  console.log('Filtered links for role', userRole, ':', filteredLinks.map(l => l.title));

  return (
    <div className="flex flex-col h-screen border-r">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span className="font-bold text-xl">Investify</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.title}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <p className="text-sm text-muted-foreground">
          Logged in as: <span className="font-medium">{userRole}</span>
        </p>
      </div>
    </div>
  );
}
