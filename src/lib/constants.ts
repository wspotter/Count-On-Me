import type { InventoryItem } from './types';

export const LOW_STOCK_THRESHOLD = 10;

export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Wireless Mouse', quantity: 25, price: 29.99, lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString() }, // 2 days ago
  { id: '2', name: 'Mechanical Keyboard', quantity: 8, price: 79.99, lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString() }, // 1 day ago
  { id: '3', name: 'USB-C Hub', quantity: 15, price: 39.50, lastUpdated: new Date().toISOString() },
  { id: '4', name: '4K Monitor', quantity: 5, price: 299.00, lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString() }, // 5 days ago
  { id: '5', name: 'Laptop Stand', quantity: 30, price: 22.75, lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString() }, // 3 days ago
  { id: '6', name: 'Webcam HD', quantity: 3, price: 49.99, lastUpdated: new Date(Date.now() - 86400000 * 7).toISOString() }, // 7 days ago
  { id: '7', name: 'Noise Cancelling Headphones', quantity: 12, price: 199.99, lastUpdated: new Date().toISOString() },
];

export const EXAMPLE_HISTORICAL_SALES = JSON.stringify([
  { "itemId": "1", "salesQuantity": 10, "date": "2023-10-01" },
  { "itemId": "1", "salesQuantity": 15, "date": "2023-10-15" },
  { "itemId": "2", "salesQuantity": 5, "date": "2023-10-05" },
  { "itemId": "2", "salesQuantity": 8, "date": "2023-10-20" }
], null, 2);

export const EXAMPLE_CURRENT_INVENTORY = JSON.stringify([
  { "itemId": "1", "quantity": 25 },
  { "itemId": "2", "quantity": 8 }
], null, 2);
