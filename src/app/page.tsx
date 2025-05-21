
'use client';

import { useState, useEffect, useMemo } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
// import { MOCK_INVENTORY_ITEMS, LOW_STOCK_THRESHOLD } from '@/lib/constants'; // No longer directly used
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { getInventoryItemsFromStorage } from '@/lib/inventory-service';
import type { InventoryItem } from '@/lib/types';
import { DollarSign, Archive, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function DashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Load inventory from localStorage or fallback to mocks via service
    setInventory(getInventoryItemsFromStorage());
  }, []);

  // Re-calculate when inventory changes
  useEffect(() => {
    const handleStorageChange = () => {
        setInventory(getInventoryItemsFromStorage());
    };
    window.addEventListener('storage', handleStorageChange); // Listen for direct localStorage changes from other tabs
    
    // Custom event listener for changes within the same tab/app
    // (e.g., if inventory-service emitted an event)
    // For simplicity, we'll rely on navigation or explicit refresh for now
    // if not using a global state manager.

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const totalItems = useMemo(() => inventory.reduce((sum, item) => sum + item.quantity, 0), [inventory]);
  const totalValue = useMemo(() => inventory.reduce((sum, item) => sum + item.quantity * item.price, 0), [inventory]);
  const lowStockItems = useMemo(() => inventory.filter(item => item.quantity < LOW_STOCK_THRESHOLD), [inventory]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Items"
          value={totalItems}
          icon={Archive}
          description="Total quantity of all items in stock"
        />
        <StatCard
          title="Inventory Value"
          value={`$${totalValue.toFixed(2)}`}
          icon={DollarSign}
          description="Estimated total value of current inventory"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          icon={AlertTriangle}
          description={`${lowStockItems.length} item(s) running low`}
          className={lowStockItems.length > 0 ? "border-destructive text-destructive dark:border-destructive" : ""}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>Items with quantity less than {LOW_STOCK_THRESHOLD}. Consider restocking soon.</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant={item.quantity === 0 ? "destructive" : "default"}>{item.quantity}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(item.lastUpdated), 'PPp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No items are currently low on stock. Well done!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
