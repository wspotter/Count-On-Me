'use server';

import { generateRestockLevels as generateRestockLevelsFlow } from '@/ai/flows/generate-restock-levels';
import type { GenerateRestockLevelsInput, GenerateRestockLevelsOutput as FlowOutput } from '@/ai/flows/generate-restock-levels';
import type { GenerateRestockLevelsOutput as PageOutput, RestockRecommendation } from '@/lib/types';

export async function generateRestockSuggestions(
  input: GenerateRestockLevelsInput
): Promise<{ success: boolean; data?: PageOutput; error?: string }> {
  try {
    // Validate input JSON strings
    JSON.parse(input.historicalSalesData);
    JSON.parse(input.currentInventoryLevels);
  } catch (e: any) {
    console.error("Invalid JSON input:", e.message);
    return { success: false, error: "Invalid JSON format in input data. Please check and try again." };
  }

  try {
    const result: FlowOutput = await generateRestockLevelsFlow(input);
    
    // Attempt to parse the JSON string from the AI
    let parsedRecommendations: RestockRecommendation[];
    try {
      parsedRecommendations = JSON.parse(result.restockRecommendations);
    } catch (parseError) {
      console.error("Failed to parse AI's restockRecommendations JSON:", parseError);
      // If parsing fails, return the raw string along with a warning or specific error structure
      return { 
        success: false, 
        error: "AI returned recommendations in an unparsable format. Raw data available.",
        data: { // Provide raw string if parsing fails
            restockRecommendations: result.restockRecommendations as any, // casting to allow string
            analysisSummary: result.analysisSummary + "\n\nWARNING: Could not parse 'restockRecommendations' as JSON.",
        }
      };
    }

    const pageOutput: PageOutput = {
      restockRecommendations: parsedRecommendations,
      analysisSummary: result.analysisSummary,
    };
    return { success: true, data: pageOutput };

  } catch (error: any) {
    console.error('Error generating restock levels:', error);
    return { success: false, error: error.message || 'Failed to generate restock suggestions.' };
  }
}
