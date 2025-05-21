// use server'

/**
 * @fileOverview This file defines a Genkit flow for generating optimal restock levels for inventory items.
 *
 * - generateRestockLevels - A function that analyzes historical sales data and current inventory levels to suggest optimal restock quantities.
 * - GenerateRestockLevelsInput - The input type for the generateRestockLevels function.
 * - GenerateRestockLevelsOutput - The return type for the generateRestockLevels function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRestockLevelsInputSchema = z.object({
  historicalSalesData: z.string().describe('Historical sales data in JSON format, including item IDs, sales quantities, and dates.'),
  currentInventoryLevels: z.string().describe('Current inventory levels in JSON format, including item IDs and quantities.'),
});
export type GenerateRestockLevelsInput = z.infer<typeof GenerateRestockLevelsInputSchema>;

const GenerateRestockLevelsOutputSchema = z.object({
  restockRecommendations: z.string().describe('Restock recommendations in JSON format, including item IDs and suggested restock quantities.'),
  analysisSummary: z.string().describe('A summary of the analysis performed to generate the restock recommendations.'),
});
export type GenerateRestockLevelsOutput = z.infer<typeof GenerateRestockLevelsOutputSchema>;

export async function generateRestockLevels(input: GenerateRestockLevelsInput): Promise<GenerateRestockLevelsOutput> {
  return generateRestockLevelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRestockLevelsPrompt',
  input: {schema: GenerateRestockLevelsInputSchema},
  output: {schema: GenerateRestockLevelsOutputSchema},
  prompt: `You are an expert inventory management system. Analyze the historical sales data and current inventory levels to suggest optimal restock quantities for each item.

Historical Sales Data: {{{historicalSalesData}}}
Current Inventory Levels: {{{currentInventoryLevels}}}

Based on this data, provide restock recommendations in JSON format, including item IDs and suggested restock quantities.
Also, provide a summary of the analysis performed to generate the restock recommendations.

Ensure the restockRecommendations field contains valid JSON.
`,
});

const generateRestockLevelsFlow = ai.defineFlow(
  {
    name: 'generateRestockLevelsFlow',
    inputSchema: GenerateRestockLevelsInputSchema,
    outputSchema: GenerateRestockLevelsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
