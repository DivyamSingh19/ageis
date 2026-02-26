import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { router as adminAuthRouter } from "./routes/admin/auth"
import { router as deliveryAuthRouter } from "./routes/delivery/auth"
import { router as farmerAuthRouter } from "./routes/farmer/auth.routes"
import { router as userAuthRouter } from "./routes/user/auth"
import keyRouter from "./blockchain/routes/key.routes"
import router from "./routes/farmer/verify"
import productRouter from "./routes/farmer/product"
const app = express()
const port = 4000

dotenv.config()
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
app.use("/api/farmer/products",productRouter )
//gemini verification route
app.post("/api/farmer/verify-product", router)





//user routes
app.use("/api/user/auth", userAuthRouter)

app.use("/api/user/keys", keyRouter)








//server
app.listen(port, () => {
    console.log("Server started on :", port);
})