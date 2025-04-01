
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

const sampleProducts = [
  {
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
    price: 199.99,
    stockQuantity: 45,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500"
  },
  {
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitoring, GPS, and water resistance.",
    price: 249.99,
    stockQuantity: 30,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=500"
  },
  {
    name: "Yoga Mat",
    description: "Non-slip, eco-friendly yoga mat, perfect for home workouts.",
    price: 29.99,
    stockQuantity: 100,
    category: "Fitness",
    imageUrl: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=500"
  },
  {
    name: "Coffee Maker",
    description: "Programmable coffee maker with built-in grinder and thermal carafe.",
    price: 129.99,
    stockQuantity: 25,
    category: "Home",
    imageUrl: "https://images.unsplash.com/photo-1606483956061-46a898dce538?q=80&w=500"
  },
  {
    name: "Leather Backpack",
    description: "Handcrafted genuine leather backpack with multiple compartments.",
    price: 89.99,
    stockQuantity: 15,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=500"
  },
  {
    name: "Portable Speaker",
    description: "Waterproof Bluetooth speaker with 12-hour playback time.",
    price: 69.99,
    stockQuantity: 50,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1589003077984-89c5c6b5261f?q=80&w=500"
  },
  {
    name: "Succulent Plant Set",
    description: "Set of 5 miniature succulent plants in decorative ceramic pots.",
    price: 24.99,
    stockQuantity: 30,
    category: "Home",
    imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=500"
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-walled insulated water bottle, keeps drinks cold for 24 hours.",
    price: 19.99,
    stockQuantity: 75,
    category: "Fitness",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=500"
  }
];

export default function ProductSeeder() {
  const { addProduct } = useProducts();
  const { getUserRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const userRole = getUserRole();

  const handleSeedProducts = async () => {
    if (userRole !== 'manager') {
      toast.error("Only managers can seed products");
      return;
    }

    try {
      setIsLoading(true);
      let addedCount = 0;

      for (const product of sampleProducts) {
        await addProduct(product);
        addedCount++;
      }

      toast.success(`Successfully added ${addedCount} sample products!`);
    } catch (error) {
      console.error("Error seeding products:", error);
      toast.error("Failed to seed products");
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole !== 'manager') {
    return null;
  }

  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted/20">
      <h2 className="text-lg font-medium mb-2">Product Database</h2>
      <p className="text-sm text-muted-foreground mb-4">
        No products found in the database. As a manager, you can add sample products to get started.
      </p>
      <Button 
        onClick={handleSeedProducts} 
        disabled={isLoading}
      >
        {isLoading ? "Adding Products..." : "Add Sample Products"}
      </Button>
    </div>
  );
}
