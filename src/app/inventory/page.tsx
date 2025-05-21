
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { InventoryItem } from '@/lib/types';
// import { MOCK_INVENTORY_ITEMS } from '@/lib/constants'; // No longer directly used for initial state
import { getInventoryItemsFromStorage, saveInventoryItemsToStorage } from '@/lib/inventory-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { DeleteConfirmationDialog } from '@/components/inventory/DeleteConfirmationDialog';
import { PlusCircle, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load inventory from localStorage or fallback to mocks via service
    setInventory(getInventoryItemsFromStorage()); 
  }, []);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const handleAddItem = (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...data,
      id: String(Date.now()) + Math.random().toString(36).substring(2, 9),
      lastUpdated: new Date().toISOString(),
    };
    const updatedInventory = [newItem, ...inventory];
    setInventory(updatedInventory);
    saveInventoryItemsToStorage(updatedInventory);
    toast({ title: "Item Added", description: `${newItem.name} has been added to inventory.` });
  };

  const handleEditItem = (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    if (!editingItem) return;
    const updatedItem: InventoryItem = {
      ...editingItem,
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    const updatedInventory = inventory.map(item => item.id === editingItem.id ? updatedItem : item);
    setInventory(updatedInventory);
    saveInventoryItemsToStorage(updatedInventory);
    toast({ title: "Item Updated", description: `${updatedItem.name} has been updated.` });
  };

  const handleDeleteItem = () => {
    if (!deletingItem) return;
    const updatedInventory = inventory.filter(item => item.id !== deletingItem.id);
    setInventory(updatedInventory);
    saveInventoryItemsToStorage(updatedInventory);
    toast({ title: "Item Deleted", description: `${deletingItem.name} has been removed.`, variant: "destructive" });
    setIsDeleteConfirmOpen(false);
    setDeletingItem(null);
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (item: InventoryItem) => {
    setDeletingItem(item);
    setIsDeleteConfirmOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory Management</h1>
        <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsFormOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add Item
            </Button>
          </DialogTrigger>
          {isFormOpen && ( 
             <InventoryForm 
              onSubmit={editingItem ? handleEditItem : handleAddItem} 
              initialData={editingItem}
              onClose={closeForm}
            />
          )}
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items by name..."
          className="w-full rounded-lg bg-background pl-10 md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredInventory.length > 0 ? (
        <InventoryTable items={filteredInventory} onEdit={openEditForm} onDelete={openDeleteConfirm} />
      ) : (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? "No items match your search." : "Your inventory is empty. Add some items to get started!"}
        </p>
      )}

      {deletingItem && (
        <DeleteConfirmationDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          onConfirm={handleDeleteItem}
          itemName={deletingItem.name}
        />
      )}
    </div>
  );
}
