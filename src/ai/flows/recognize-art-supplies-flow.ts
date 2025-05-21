'use server';
/**
 * @fileOverview An AI flow for recognizing and counting art supplies in an image.
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
});
export type RecognizeArtSuppliesInput = z.infer<typeof RecognizeArtSuppliesInputSchema>;

const ArtSupplyItemSchema = z.object({
  name: z.string().describe("The specific name of the art supply (e.g., 'Watercolor paint tube - Ultramarine Blue', 'Sketch pencil - HB', 'Canvas Panel 8x10 inch')."),
  count: z.number().int().min(1).describe("The number of this specific item identified in the image."),
});

const RecognizeArtSuppliesOutputSchema = z.object({
  recognizedItems: z.array(ArtSupplyItemSchema).describe("A JSON array of art supplies identified and their counts. Each item should have a 'name' and 'count'."),
  analysisSummary: z.string().describe("A brief summary of the recognition process, any general observations about the art supplies depicted, or any difficulties encountered."),
});
export type RecognizeArtSuppliesOutput = z.infer<typeof RecognizeArtSuppliesOutputSchema>;


export async function recognizeArtSupplies(input: RecognizeArtSuppliesInput): Promise<RecognizeArtSuppliesOutput> {
  return recognizeArtSuppliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeArtSuppliesPrompt',
  input: {schema: RecognizeArtSuppliesInputSchema},
  output: {schema: RecognizeArtSuppliesOutputSchema},
  prompt: `You are an advanced AI assistant specializing in art supply recognition and inventory.
Your task is to meticulously analyze the provided image, identify each distinct art supply item, and count its quantity.
Be very specific with item names (e.g., "Acrylic Paint Tube - Cadmium Red" instead of just "Paint Tube", "Round Tip Paintbrush - Size 4" instead of "Paintbrush").
If applicable, include sizes or specific types if visually discernible.

Image data: {{media url=imageDataUri}}

Crucially, the 'recognizedItems' field in your output MUST be a valid JSON array of objects, where each object contains a 'name' (string) and 'count' (integer) for an identified art supply.
Focus on accuracy for both identification and counting.
If multiple instances of the exact same item are present, count them together under one entry.
If an item is partially obscured but reasonably identifiable, include it.
Your analysisSummary can include general observations or any challenges faced.
Example for recognizedItems: [{"name": "Sketch Pencils - Set of 12", "count": 1}, {"name": "Watercolor Pan - Viridian Green", "count": 3}]
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
    // The model is instructed to return a JSON string for recognizedItems,
    // but the schema definition might lead Genkit/Gemini to parse it directly.
    // We will handle parsing in the calling server action to be safe.
    return output;
  }
);
