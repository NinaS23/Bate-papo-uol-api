import express , {json} from "express"
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"

const PORT = 5000
const string = joi.object({
    name: joi.string().required()
  })
  

const dontev = dotenv.config();
const app = express()
app.use(cors())
app.use(json())

app.post("/participants" , (req,res)=>{
    const username= req.body
    console.log(username)

     
})


app.listen(PORT , ()=>{
    console.log("wake")
})