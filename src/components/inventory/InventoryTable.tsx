'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit3, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import type { InventoryItem } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { format } from 'date-fns';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

type SortKey = keyof InventoryItem | null;

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null && sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Ensure 'barcode' is handled correctly as it's optional
        const valA = sortConfig.key === 'barcode' ? a.barcode || '' : a[sortConfig.key!];
        const valB = sortConfig.key === 'barcode' ? b.barcode || '' : b[sortConfig.key!];


        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof InventoryItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof InventoryItem) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
            Name {getSortIndicator('name')}
          </TableHead>
          <TableHead onClick={() => requestSort('quantity')} className="cursor-pointer text-right">
            Quantity {getSortIndicator('quantity')}
          </TableHead>
          <TableHead onClick={() => requestSort('barcode')} className="cursor-pointer">
            Barcode {getSortIndicator('barcode')}
          </TableHead>
          <TableHead onClick={() => requestSort('price')} className="cursor-pointer text-right">
            Price {getSortIndicator('price')}
          </TableHead>
          <TableHead onClick={() => requestSort('lastUpdated')} className="cursor-pointer">
            Last Updated {getSortIndicator('lastUpdated')}
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-right">
              <Badge variant={item.quantity < LOW_STOCK_THRESHOLD ? (item.quantity === 0 ? "destructive" : "secondary") : "default"}>
                {item.quantity}
              </Badge>
            </TableCell>
            <TableCell>{item.barcode || 'N/A'}</TableCell>
            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
            <TableCell>{format(new Date(item.lastUpdated), 'PP')}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
