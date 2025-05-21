
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  barcode?: string; // Added barcode field
  lastUpdated: string; // ISO string date
}

// For AI flow, if needed to type parsed JSON
export interface RestockRecommendation {
  itemId: string;
  suggestedRestockQuantity: number;
}

export interface GenerateRestockLevelsOutput {
  restockRecommendations: RestockRecommendation[];
  analysisSummary: string;
}

// --- New types for Art Recognition ---
export interface RecognizedArtSupply {
  name: string; // e.g., "Paintbrush - Round Tip", "Acrylic Paint Tube - Red"
  count: number;
  barcode?: string; // AI might detect a barcode
}

export interface RecognizeArtSuppliesOutput {
  recognizedItems: RecognizedArtSupply[];
  analysisSummary: string; // General comments from the AI
}
