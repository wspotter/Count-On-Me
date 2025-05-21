
# Count-On-Me - Efficient Inventory Management

"Count-On-Me" is a Next.js application designed for efficient inventory management, particularly for retail stores like art supplies. It features AI-powered tools like "Quick Counter" for recognizing items from images, counting them, and attempting to read barcodes.

## Features

- **Dashboard:** Overview of total items, inventory value, and low stock alerts.
- **Inventory Management:** Add, edit, delete, and search inventory items. Includes support for item names, quantities, prices, and barcodes.
- **Quick Counter (AI-Powered):**
    - Upload an image or use a webcam to capture art supplies.
    - AI identifies items, counts them, and attempts to read barcodes.
    - Users can provide specific instructions to the AI (e.g., "only count red items").
    - Results are displayed in an editable form.
    - Corrected counts and new items can be saved directly to the inventory.
- **Smart Restock Suggestions (AI-Powered):** Input historical sales and current inventory data (JSON format) to get AI-driven restock recommendations.

## Tech Stack

- **Next.js:** React framework for server-side rendering and static site generation.
- **React:** JavaScript library for building user interfaces.
- **TypeScript:** Superset of JavaScript adding static typing.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **ShadCN UI:** Re-usable UI components.
- **Genkit (with Google Gemini or OpenAI):** AI integration for object recognition, barcode reading attempts, and restock suggestions.
- **Lucide React:** Icon library.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js) or [Yarn](https://yarnpkg.com/)

### 1. Clone the Repository (if applicable)

If you have the project files in a Git repository, clone it:

```bash
git clone <your-repository-url>
cd count-on-me 
```

If you downloaded the project as a ZIP, extract it and navigate into the project directory.

### 2. Install Dependencies

Install the necessary project dependencies using npm or yarn:

```bash
npm install
```
or
```bash
yarn install
```

### 3. Set Up Environment Variables

The application uses Genkit for its AI features, which can be configured to use either Google's Gemini models or OpenAI's models.

1.  Create a file named `.env` in the root of your project directory (if it doesn't already exist).
2.  Configure the AI provider and API keys. Copy and paste the following into your `.env` file, then replace the placeholder values with your actual keys and desired settings:

    ```env
    # --- AI Provider Configuration ---
    # Set AI_PROVIDER to "googleai" or "openai"
    AI_PROVIDER=googleai # or openai

    # --- Google AI Configuration (only needed if AI_PROVIDER is "googleai") ---
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    # Specify the Gemini model you want to use, e.g., gemini-1.5-flash-latest, gemini-pro
    GEMINI_MODEL_NAME=gemini-1.5-flash-latest

    # --- OpenAI Configuration (only needed if AI_PROVIDER is "openai") ---
    OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
    # Specify the OpenAI model, e.g., gpt-4-turbo-preview, gpt-3.5-turbo
    OPENAI_MODEL_NAME=gpt-4-turbo-preview 
    # Optional: Specify a custom base URL for OpenAI-compatible APIs (e.g., for local models or proxies)
    # Example: OPENAI_BASE_URL=http://localhost:1234/v1
    # OPENAI_BASE_URL= 
    ```

    **Important:**
    *   Set `AI_PROVIDER` to either `googleai` or `openai`.
    *   If using `googleai`, ensure `GEMINI_API_KEY` and optionally `GEMINI_MODEL_NAME` are set.
    *   If using `openai`, ensure `OPENAI_API_KEY` and optionally `OPENAI_MODEL_NAME` and `OPENAI_BASE_URL` are set.
    *   You only need to provide the API key for the provider you select with `AI_PROVIDER`.

### 4. Run the Development Servers

You need to run two development servers simultaneously:
    - The Next.js development server for the frontend application.
    - The Genkit development server for the AI flows.

Open two terminal windows or tabs in your project's root directory.

**Terminal 1: Start the Next.js App**

```bash
npm run dev
```
This will typically start the Next.js application on `http://localhost:9002`.

**Terminal 2: Start the Genkit Flows**

For development with auto-reloading of Genkit flows when you make changes:
```bash
npm run genkit:watch
```
Alternatively, to just start the Genkit server once:
```bash
npm run genkit:dev
```
This will start the Genkit development environment, usually making the flows available locally (Genkit often runs its own UI on `http://localhost:4000` for inspecting flows, but the Next.js app communicates with it programmatically).

### 5. Access the Application

Once both servers are running without errors:

- Open your web browser and navigate to `http://localhost:9002` (or the port Next.js indicates) to use the "Count On Me" application.

## Available Scripts

- `npm run dev`: Starts the Next.js development server (with Turbopack).
- `npm run genkit:dev`: Starts the Genkit development server for AI flows.
- `npm run genkit:watch`: Starts the Genkit development server with file watching for AI flows.
- `npm run build`: Builds the Next.js application for production.
- `npm run start`: Starts the Next.js production server (after building).
- `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
- `npm run typecheck`: Runs TypeScript to check for type errors.

## Project Structure (Key Directories)

- `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
- `src/components/`: Shared UI components.
  - `src/components/ui/`: ShadCN UI components.
- `src/lib/`: Utility functions, constants, type definitions, and services (like `inventory-service.ts`).
- `src/ai/`: Genkit related code.
  - `src/ai/flows/`: Genkit AI flows.
- `public/`: Static assets (like images).
```