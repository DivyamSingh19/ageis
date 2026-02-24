// controllers/geminiVerification.controller.ts
import axios from "axios";
import { analyzeProductImage } from "../../config/gemini";
import { SEASONALITY_MAP } from "../../rules/seasonality.rules";
import { ProductService } from "../../services/products/main";
import { Request, Response } from "express";

export const verifyProductWithGemini = async (req:Request, res:Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId required" });
    }

    const product = await ProductService.getById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Fetch image from Pinata
    const imageResponse = await axios.get(product.pinataImageUrl, {
      responseType: "arraybuffer"
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // Gemini analysis
    const aiResult = await analyzeProductImage({
      imageBuffer,
      productName: product.name,
      country: "India"
    });

    // Local seasonality verification (authoritative)
    const detectedKey = aiResult.identifiedItem?.toLowerCase();
    const seasonMonths = SEASONALITY_MAP[detectedKey] || [];

    const seasonalityValid =
      seasonMonths.length > 0 &&
      (seasonMonths.includes("All") ||
        seasonMonths.length === aiResult.seasonMonths.length);

    const matches =
      aiResult.matchesProductName === true &&
      aiResult.confidence >= 0.7 &&
      seasonalityValid;

    return res.json({
      productId,
      matches,
      confidence: aiResult.confidence,
      detectedItem: aiResult.identifiedItem,
      variety: aiResult.variety,
      isFruit: aiResult.isFruit,
      isSeasonal: seasonalityValid,
      seasonMonths,
      reasoning: aiResult.notes,
      aiRaw: aiResult // optional, useful for audits
    });
  } catch (err: any) {
    console.error("Gemini verification error:", err.message);
    return res.status(500).json({
      error: "Verification failed",
      details: err.message
    });
  }
};