import { Package } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2 p-2">
      <Package className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-foreground">StockPilot</span>
    </div>
  );
}
