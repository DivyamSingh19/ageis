import express,{Request,Response} from "express"
import cors from "cors"
import dotenv from "dotenv"
const app = express()
const port = 4000


dotenv.config()
app.use(express.json())

declare global{
    namespace Express{
        interface Request{
            userId?:string,
            farmerId?:string
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


app.listen(port,()=>{
    console.log("Server started on :",port);
    
})