import express,{Request,Response} from "express"
import cors from "cors"
import dotenv from "dotenv"
import {router as adminAuthRouter} from "./routes/admin/auth"
import {router as deliveryAuthRouter} from "./routes/delivery/auth"   
import {router as farmerAuthRouter} from "./routes/farmer/auth.routes"
import {router as userAuthRouter} from "./routes/user/auth"
import keyRouter from "./blockchain/routes/key.routes"
const app = express()
const port = 4000

dotenv.config()
app.use(express.json())
app.use(cors())
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

//admin routes
app.use("/api/admin/auth",adminAuthRouter)

 






//delivery partner routes
app.use("/api/delivery/auth",deliveryAuthRouter)






//farmer routes
app.use("/api/farmer/auth",farmerAuthRouter)







//user routes
app.use("/api/user/auth",userAuthRouter)

app.use("/api/user/keys",keyRouter)









app.listen(port,()=>{
    console.log("Server started on :",port);
})