
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        return;
    }
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error in response:", data);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
