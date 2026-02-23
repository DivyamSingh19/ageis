import express,{Request,Response} from "express"
import cors from "cors"
import dotenv from "dotenv"
import {router as adminAuthRouter} from "./routes/admin/auth"
import {router as deliveryAuthRouter} from "./routes/delivery/auth"   
import {router as farmerAuthRouter} from "./routes/farmer/auth.routes"
import {router as consumerAuthRouter} from "./routes/user/auth.route"
const app = express()
const port = 4000


dotenv.config()
app.use(express.json())

declare global{
    namespace Express{
        interface Request{
            userId?:string,
            farmerId?:string,
            adminId?:string,
            deliveryAgentId?:string
        }
    }
}
app.get("/",async (req:Request,res:Response) => {
    try {
        res.json({
            success:true
        })
    } catch (error) {
        console.log(error);
        res.json({
            message:"API failed"
        })
    }
})

//auth routes
app.use("/api/admin/auth",adminAuthRouter)
app.use("/api/delivery/auth",deliveryAuthRouter)
app.use("/api/farmer/auth",farmerAuthRouter)
app.use("/api/consumer/auth",consumerAuthRouter)



app.listen(port,()=>{
    console.log("Server started on :",port);
    
})