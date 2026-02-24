// config/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiVisionModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

export async function analyzeProductImage(params: {
  imageBuffer: Buffer;
  productName: string;
  country: string;
}) {
  const { imageBuffer, productName, country } = params;

  const systemPrompt = `
You are an AI verification agent used in a food supply-chain security system.

Your job is to verify whether a product image matches the provided product metadata.
You must analyze the image objectively and conservatively.

You are NOT allowed to guess.
If you are uncertain, mark the result as a mismatch and lower the confidence score.

Respond ONLY in valid JSON.
`;

  const taskPrompt = `
We are verifying a food product as part of a trust and anti-fraud system.

Product Name: ${productName}
Country: ${country}

Tasks:
1. Identify the food item visible in the image.
2. Check if it matches the provided product name.
3. Identify whether it is a fruit or vegetable.
4. Determine whether it is seasonal in ${country}.
5. Provide a confidence score between 0 and 1.

Respond ONLY in this JSON schema:
{
  "identifiedItem": string,
  "variety": string | null,
  "matchesProductName": boolean,
  "confidence": number,
  "isFruit": boolean,
  "isSeasonalInIndia": boolean,
  "seasonMonths": string[],
  "notes": string
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
    return JSON.parse(rawText);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }
}