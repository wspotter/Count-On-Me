import { config } from 'dotenv';
config();

import '@/ai/flows/generate-restock-levels.ts';
import '@/ai/flows/recognize-art-supplies-flow.ts'; // Added new flow
