'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";
import { generateRestockSuggestions } from './actions';
import type { GenerateRestockLevelsOutput, RestockRecommendation } from '@/lib/types';
import { EXAMPLE_HISTORICAL_SALES, EXAMPLE_CURRENT_INVENTORY } from '@/lib/constants';

export default function RestockPage() {
  const [historicalSales, setHistoricalSales] = useState(EXAMPLE_HISTORICAL_SALES);
  const [currentInventory, setCurrentInventory] = useState(EXAMPLE_CURRENT_INVENTORY);
  const [recommendations, setRecommendations] = useState<GenerateRestockLevelsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const result = await generateRestockSuggestions({
      historicalSalesData: historicalSales,
      currentInventoryLevels: currentInventory,
    });

    if (result.success && result.data) {
      setRecommendations(result.data);
    } else {
      setError(result.error || 'An unknown error occurred.');
      if (result.data) { // Handle case where AI output parsing failed but raw data is available
        setRecommendations(result.data);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Smart Restock Suggestions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Input Data</CardTitle>
          <CardDescription>Provide historical sales data and current inventory levels in JSON format.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="historical-sales">Historical Sales Data (JSON)</Label>
            <Textarea
              id="historical-sales"
              value={historicalSales}
              onChange={(e) => setHistoricalSales(e.target.value)}
              rows={8}
              placeholder='e.g., [{"itemId": "SKU001", "salesQuantity": 50, "date": "2023-01-15"}, ...]'
              className="font-mono text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="current-inventory">Current Inventory Levels (JSON)</Label>
            <Textarea
              id="current-inventory"
              value={currentInventory}
              onChange={(e) => setCurrentInventory(e.target.value)}
              rows={8}
              placeholder='e.g., [{"itemId": "SKU001", "quantity": 20}, ...]'
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Suggestions
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Restock List</h3>
              {Array.isArray(recommendations.restockRecommendations) && recommendations.restockRecommendations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead className="text-right">Suggested Restock Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.restockRecommendations.map((rec, index) => (
                      <TableRow key={rec.itemId || index}>
                        <TableCell>{rec.itemId}</TableCell>
                        <TableCell className="text-right">{rec.suggestedRestockQuantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : typeof recommendations.restockRecommendations === 'string' ? (
                 <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Raw recommendations (AI output might be malformed):</p>
                    <pre className="whitespace-pre-wrap text-xs">{recommendations.restockRecommendations}</pre>
                 </div>
              ) : (
                <p className="text-muted-foreground">No restock recommendations provided or data is in an unexpected format.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-lg">Analysis Summary</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted p-4 rounded-md">
                {recommendations.analysisSummary || "No analysis summary provided."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
