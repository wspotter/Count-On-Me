export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
