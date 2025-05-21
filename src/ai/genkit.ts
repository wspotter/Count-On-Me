import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openai} from '@genkit-ai/openai'; // Package removed
import {config} from 'dotenv';

config(); // Load environment variables from .env

const provider = process.env.AI_PROVIDER || 'googleai'; // Default to googleai
let selectedModelName: string;
let plugins: any[];

if (provider === 'openai') {
  // OpenAI functionality is disabled because @genkit-ai/openai package could not be installed.
  console.error(
    'OpenAI provider selected, but @genkit-ai/openai package is not available or removed. ' +
    'OpenAI functionality will be disabled. Falling back to Google AI if configured, or Genkit may fail.'
  );
  // To prevent a hard crash if 'openai' is explicitly set, we should throw an error.
  // Or, ensure a graceful fallback if googleAI is not the default and not configured.
  // For now, this will throw an error if 'openai' is the provider.
  throw new GenkitError(
    'OpenAI provider is selected in .env, but the @genkit-ai/openai package is not installed or removed due to installation issues. ' +
    'Please resolve the package issue or select a different AI_PROVIDER.'
  );
  // If you had a scenario where you wanted to fall back silently, you'd handle it differently,
  // but it's better to be explicit about the missing functionality.
  // plugins = []; // Or handle fallback
  // selectedModelName = '';

} else if (provider === 'googleai') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GenkitError('GEMINI_API_KEY environment variable is not set for Google AI provider.');
  }
  selectedModelName = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash-latest';
  plugins = [googleAI({apiKey})];
  console.log(`Using Google AI provider with model: ${selectedModelName}`);
} else {
  throw new GenkitError(
    `Unsupported AI_PROVIDER: ${provider}. Must be 'googleai'. (OpenAI support is currently disabled due to package issues)`
  );
}

export const ai = genkit({
  plugins,
  model: selectedModelName, // Set the default model based on the selected provider
});
