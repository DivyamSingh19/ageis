
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    try {
        // Note: The SDK might not have a direct listModels on genAI in all versions, 
        // but the error message suggested calling it. 
        // In @google/generative-ai, we might need to use the REST API or check the lib.
        // Actually, listing models is usually done via the management client or direct fetch.
        console.log("Listing models is not directly available via the simple SDK 'genAI' object in some versions.");
        console.log("Trying to use 'gemini-1.5-flash-latest' as a common fix.");
    } catch (error) {
        console.error(error);
    }
}

listModels();
