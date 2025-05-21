
'use client';

import type { InventoryItem, RecognizedArtSupply } from './types';
import { MOCK_INVENTORY_ITEMS } from './constants';

const INVENTORY_STORAGE_KEY = 'stockpilot-inventory';

// Helper function to ensure localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__testLocalStorage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

export function getInventoryItemsFromStorage(): InventoryItem[] {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Returning MOCK_INVENTORY_ITEMS.');
    return MOCK_INVENTORY_ITEMS.map(item => ({ ...item, barcode: item.barcode || undefined })); // Ensure barcode is part of the type
  }
  try {
    const storedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (storedInventory) {
      const items: InventoryItem[] = JSON.parse(storedInventory);
      return items.map(item => ({ ...item, barcode: item.barcode || undefined }));
    } else {
      // Initialize with mock data if nothing is in localStorage
      const initialItems = MOCK_INVENTORY_ITEMS.map(item => ({ ...item, barcode: item.barcode || undefined }));
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(initialItems));
      return initialItems;
    }
  } catch (error) {
    console.error("Error reading inventory from localStorage:", error);
    // Fallback in case of parsing error or other issues
    const fallbackItems = MOCK_INVENTORY_ITEMS.map(item => ({ ...item, barcode: item.barcode || undefined }));
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(fallbackItems));
    return fallbackItems;
  }
}

export function saveInventoryItemsToStorage(items: InventoryItem[]): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available. Inventory changes will not persist.');
    return;
  }
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items.map(item => ({ ...item, barcode: item.barcode || undefined }))));
  } catch (error) {
    console.error("Error saving inventory to localStorage:", error);
  }
}

export function updateInventoryWithRecognizedItems(recognizedItems: RecognizedArtSupply[]): InventoryItem[] {
  let currentInventory = getInventoryItemsFromStorage();

  recognizedItems.forEach(recognizedItem => {
    if (recognizedItem.count <= 0) return; // Skip items with zero or negative count

    const existingItemIndex = currentInventory.findIndex(
      invItem => invItem.name.trim().toLowerCase() === recognizedItem.name.trim().toLowerCase()
    );

    if (existingItemIndex > -1) {
      // Item exists, update its quantity and lastUpdated
      const updatedItem = { ...currentInventory[existingItemIndex] };
      updatedItem.quantity += recognizedItem.count; // Add to existing quantity
      updatedItem.lastUpdated = new Date().toISOString();
      currentInventory[existingItemIndex] = updatedItem;
    } else {
      // Item does not exist, add it as a new inventory item
      const newItem: InventoryItem = {
        id: String(Date.now()) + Math.random().toString(36).substring(2, 9), // More unique ID
        name: recognizedItem.name.trim(),
        quantity: recognizedItem.count,
        price: 0.00, // Default price for new items from recognition
        barcode: undefined, // New items from recognition don't have a barcode initially
        lastUpdated: new Date().toISOString(),
      };
      currentInventory.push(newItem);
    }
  });

  saveInventoryItemsToStorage(currentInventory);
  return currentInventory;
}
