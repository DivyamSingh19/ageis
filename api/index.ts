import dotenv from "dotenv"
dotenv.config()

import express, { Request, Response } from "express"
import cors from "cors"
import { router as farmerAuthRouter } from "./routes/farmer/auth.routes"
import { router as userAuthRouter } from "./routes/user/auth"
import keyRouter from "./blockchain/routes/key.routes"
import userKeyRouter from "./blockchain/routes/user.key.route"
import { router as userProfileRouter } from "./routes/user/profile"
import { router as userOrderRouter } from "./routes/user/order"
import productDiscoveryRouter from "./routes/user/product"
import router from "./routes/farmer/verify"
import productRouter from "./routes/farmer/product"
import { router as userNFCRouter } from "./routes/user/nfc"
import prisma from "./db/prisma"
import farmerProfileRouter from "./routes/farmer/profile"
import farmerOrderRouter from "./routes/farmer/order"
import deliveryRouter from "./routes/farmer/delivery"


const app = express()
const port = 4000

app.use(express.json())
app.use(cors())
declare global {
    namespace Express {
        interface Request {
            userId?: string,
            farmerId?: string,
            adminId?: string,
            deliveryAgentId?: string
        }
    }
}


app.get("/", async (req: Request, res: Response) => {
    try {
        res.json({
            success: true
        })
    } catch (error) {
        console.log(error);
        res.json({
            message: "API failed"
        })
    }
})




//farmer routes
app.use("/api/farmer/auth", farmerAuthRouter)
app.use("/api/farmer/keys", keyRouter)
app.use("/api/farmer-profile", farmerProfileRouter)
app.use("/api/farmer/products", productRouter)
app.use("/api/farmer/orders", farmerOrderRouter)
app.use("/api/farmer/delivery", deliveryRouter)
//gemini verification route
app.use("/api/farmer", router)

// public metadata endpoint for Solana NFT metadata_uri
app.get("/api/metadata/products/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const product = await prisma.products.findUnique({
            where: { id: id as string },
            include: {
                farmer: { select: { name: true } },
            },
        }) as any
0
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const baseUrl = process.env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get("host")}`
        const image = product.pinataImageUrl?.[0] ?? null

        return res.json({
            name: product.name,
            symbol: "AGEIS",
            description: product.description,
            image,
            external_url: `${baseUrl}/products/${product.id}`,
            attributes: [
                ...(product.category ? [{ trait_type: "category", value: product.category }] : []),
                ...(product.farmLocation ? [{ trait_type: "farmLocation", value: product.farmLocation }] : []),
                { trait_type: "verified", value: product.verified ? "true" : "false" },
                { trait_type: "farmer", value: product.farmer?.name ?? "unknown" },
            ],
            properties: {
                files: image ? [{ uri: image, type: "image/*" }] : [],
                category: "image",
            },
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Metadata endpoint failed" })
    }
})





//user routes
app.use("/api/user/auth", userAuthRouter)
app.use("/api/user/keys", userKeyRouter)
app.use("/api/user/profile", userProfileRouter)
app.use("/api/user/products", productDiscoveryRouter)
app.use("/api/user/order", userOrderRouter)
app.use("/api/user/nfc", userNFCRouter)








//server
app.listen(port, () => {
    console.log("Server started on :", port);
})