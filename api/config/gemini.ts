// config/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiVisionModel = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview"
});

export async function analyzeProductImage(params: {
  imageBuffer: Buffer;
  productName: string;
  country: string;
}) {
  const { imageBuffer, productName, country } = params;

  const systemPrompt = `
You are an AI verification agent used in a food supply-chain security system.
Your job is to verify whether a product image matches the provided product metadata (Product Name and Country).
Respond ONLY in valid JSON.
`;

  const taskPrompt = `
Identify the food item in the image and verify if it matches the metadata.

Product Name: ${productName}
Country: ${country}

Respond ONLY in this JSON schema:
{
  "verified": boolean,
  "reason": string
}
`;

  const result = await geminiVisionModel.generateContent([
    { text: systemPrompt },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBuffer.toString("base64")
      }
    },
    { text: taskPrompt }
  ]);

  const rawText = result.response.text();

  try {
    // Remove potential markdown formatting from Gemini response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : rawText;
    return JSON.parse(cleanJson);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }
}