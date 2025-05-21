'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { InventoryItem } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  quantity: z.coerce.number().min(0, { message: "Quantity cannot be negative." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }),
});

type InventoryFormValues = z.infer<typeof formSchema>;

interface InventoryFormProps {
  onSubmit: (data: InventoryFormValues) => void;
  initialData?: InventoryItem | null;
  onClose: () => void;
}

export function InventoryForm({ onSubmit, initialData, onClose }: InventoryFormProps) {
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData 
      ? { name: initialData.name, quantity: initialData.quantity, price: initialData.price } 
      : { name: '', quantity: 0, price: 0 },
  });

  const handleSubmit = (values: InventoryFormValues) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Edit Item' : 'Add New Item'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Wireless Mouse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 25" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g. 29.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </DialogClose>
            <Button type="submit">{initialData ? 'Save Changes' : 'Add Item'}</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
