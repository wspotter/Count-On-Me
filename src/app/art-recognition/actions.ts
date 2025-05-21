'use server';

import { recognizeArtSupplies as recognizeArtSuppliesFlow } from '@/ai/flows/recognize-art-supplies-flow';
import type { RecognizeArtSuppliesInput, RecognizeArtSuppliesOutput as FlowOutput } from '@/ai/flows/recognize-art-supplies-flow';
import type { RecognizeArtSuppliesOutput as PageOutput, RecognizedArtSupply } from '@/lib/types';

export async function analyzeArtSuppliesImage(
  input: RecognizeArtSuppliesInput
): Promise<{ success: boolean; data?: PageOutput; error?: string }> {
  if (!input.imageDataUri || !input.imageDataUri.startsWith('data:image')) {
    return { success: false, error: "Invalid image data provided." };
  }

  try {
    const result: FlowOutput = await recognizeArtSuppliesFlow(input);
    
    let parsedItems: RecognizedArtSupply[];

    if (typeof result.recognizedItems === 'string') {
      // This case handles if the LLM returns a stringified JSON for recognizedItems,
      // despite the schema hint. It's a fallback.
      try {
        parsedItems = JSON.parse(result.recognizedItems as any); // Cast to any if it's a string
      } catch (parseError) {
        console.error("Failed to parse AI's recognizedItems JSON string:", parseError);
        return { 
          success: false, 
          error: "AI returned item list in an unparsable string format.",
          // Potentially include raw string in data if helpful for debugging
          data: {
            recognizedItems: result.recognizedItems as any, // Send raw string
            analysisSummary: result.analysisSummary + "\n\nWARNING: Could not parse 'recognizedItems' string as JSON.",
          }
        };
      }
    } else if (Array.isArray(result.recognizedItems)) {
      // This case handles if Genkit/Gemini correctly structured the output according to schema.
      parsedItems = result.recognizedItems as RecognizedArtSupply[];
    } else {
        console.error("AI's recognizedItems is not an array or string:", result.recognizedItems);
        return {
            success: false,
            error: "AI returned an unexpected format for the item list.",
            data: {
                recognizedItems: [] as RecognizedArtSupply[], // empty array
                analysisSummary: result.analysisSummary + "\n\nERROR: 'recognizedItems' was not in the expected array format.",
            }
        }
    }
    

    const pageOutput: PageOutput = {
      recognizedItems: parsedItems,
      analysisSummary: result.analysisSummary,
    };
    return { success: true, data: pageOutput };

  } catch (error: any) {
    console.error('Error recognizing art supplies:', error);
    return { success: false, error: error.message || 'Failed to analyze art supplies.' };
  }
}
