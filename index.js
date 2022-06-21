import express , {json} from "express"
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"

const PORT = 5000
const string = joi.object({
    name: joi.string().required()
  })
  

const dontev = dotenv.config();
console.log(dontev)
const app = express()
app.use(cors())
app.use(json())

app.post("/participants" , (req,res)=>{
    const participante = req.body
    console.log(participante)
     
})


app.listen(PORT , ()=>{
    console.log("wake")
})