
'use server';
/**
 * @fileOverview An AI flow for recognizing and counting art supplies in an image, with barcode detection.
 *
 * - recognizeArtSupplies - A function that handles art supply recognition from an image.
 * - RecognizeArtSuppliesInput - The input type for the recognizeArtSupplies function.
 * - RecognizeArtSuppliesOutput - The return type for the recognizeArtSupplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeArtSuppliesInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of art supplies, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userInstructions: z
    .string()
    .optional()
    .describe(
      'Optional specific instructions for the AI, e.g., "only count red items", "focus on the top shelf".'
    ),
});
export type RecognizeArtSuppliesInput = z.infer<typeof RecognizeArtSuppliesInputSchema>;

const ArtSupplyItemSchema = z.object({
  name: z.string().describe("The specific name of the art supply (e.g., 'Watercolor paint tube - Ultramarine Blue', 'Sketch pencil - HB', 'Canvas Panel 8x10 inch')."),
  count: z.number().int().min(1).describe("The number of this specific item identified in the image."),
  barcode: z.string().optional().describe("The barcode digits if clearly visible and readable on the item. Omit if not clearly legible or not present."),
});

const RecognizeArtSuppliesOutputSchema = z.object({
  recognizedItems: z.array(ArtSupplyItemSchema).describe("A JSON array of art supplies identified and their counts. Each item should have a 'name', 'count', and optionally 'barcode'."),
  analysisSummary: z.string().describe("A brief summary of the recognition process, any general observations about the art supplies depicted, any difficulties encountered, and how user instructions were applied. Mention if barcode reading was attempted and its success."),
});
export type RecognizeArtSuppliesOutput = z.infer<typeof RecognizeArtSuppliesOutputSchema>;


export async function recognizeArtSupplies(input: RecognizeArtSuppliesInput): Promise<RecognizeArtSuppliesOutput> {
  return recognizeArtSuppliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeArtSuppliesPrompt',
  input: {schema: RecognizeArtSuppliesInputSchema},
  output: {schema: RecognizeArtSuppliesOutputSchema},
  prompt: `You are an advanced AI assistant specializing in art supply recognition, counting, and inventory.
Your task is to meticulously analyze the provided image, identify each distinct art supply item, count its quantity, and attempt to read any visible barcodes.
Be very specific with item names (e.g., "Acrylic Paint Tube - Cadmium Red" instead of just "Paint Tube", "Round Tip Paintbrush - Size 4" instead of "Paintbrush").
If applicable, include sizes or specific types if visually discernible.

Image data: {{media url=imageDataUri}}

{{#if userInstructions}}
Please follow these specific instructions: {{{userInstructions}}}
{{/if}}

For each identified item:
1.  Provide its name.
2.  Provide its count.
3.  If a barcode is clearly visible and legible on the item, extract the barcode digits and include them in the 'barcode' field. If no barcode is visible, or it's unreadable, omit the 'barcode' field for that item or set it to an empty string.

Crucially, the 'recognizedItems' field in your output MUST be a valid JSON array of objects, where each object contains a 'name' (string), 'count' (integer), and an optional 'barcode' (string) for an identified art supply.
Focus on accuracy for identification, counting, and barcode reading.
If multiple instances of the exact same item are present, count them together under one entry.
If an item is partially obscured but reasonably identifiable, include it.
Your analysisSummary can include general observations, any challenges faced (especially with barcode reading), and how you applied the user's instructions.
Example for recognizedItems: [{"name": "Sketch Pencils - Set of 12", "count": 1, "barcode": "123456789012"}, {"name": "Watercolor Pan - Viridian Green", "count": 3}]
`,
});

const recognizeArtSuppliesFlow = ai.defineFlow(
  {
    name: 'recognizeArtSuppliesFlow',
    inputSchema: RecognizeArtSuppliesInputSchema,
    outputSchema: RecognizeArtSuppliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to provide an output.");
    }
    return output;
  }
);
