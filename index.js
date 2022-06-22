import express , {json} from "express";
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"
import { MongoClient } from "mongodb";



const dontev = dotenv.config();
const app = express()
app.use(cors())
app.use(json())

let db;
const mongoClient = new MongoClient(process.env.BANCO_URL);
const promise = mongoClient.connect();

promise.then(() => {
  db = mongoClient.db("api_bate_papo_uol");
  console.log("conectou ao banco do bate-papo-uol");
})
promise.catch(res => console.log(chalk.red("deu xabu"), res))



const schema = joi.object({
    name: joi.string().min(1).required()
  })
  

app.post("/participants" , (req,res)=>{
    const user= req.body
    console.log(user)
    try{
        const validateName =  schema.validate(user)
        console.log(validateName)
           if(validateName.error){
                res.status(422)
           }
    }catch (err) { }

   
})


app.listen(5000 , ()=>{
    console.log("wake")
})