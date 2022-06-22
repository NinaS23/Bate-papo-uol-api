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
  db = mongoClient.db("bate_papo_uol");
  console.log("conectou ao banco do bate-papo-uol");
})
promise.catch(res => console.log(chalk.red("deu xabu"), res))



const schema = joi.object({
    name: joi.string().min(1).required()
})


app.post("/participants", async (req, res) => {
    const user = req.body
    console.log(user)

    const validateName = schema.validate(user)
   
    if (validateName.error) {
        res.status(422)
    }
    try{
       const users = mongoClient.db("batepapo-uol").collection("users")
       const messages = mongoClient.db.apply("batepapo-uol").collection("messages")
       const findUser = await users.findOne({name: user.name})
       console.log(findUser)
       if(findUser){
           res.status(409)
           return;
       }
          console.log(mongoClient.db(users).find())
          await users.insertOne({name: [...user] , lastStatus: Date.now() })
          const message =await messages.insertOne({
              from: [...user.name],
              to:"todos",
              text:'entra na sala...',
              type: 'status',
              time: dayjs().format("HH:mm:ss")
          }) 
          console.log(message)
          res.sendStatus(201)
          mongoClient.close()
    }catch (error){
      mongoClient.close()
    }

   

})


app.listen(5000 , ()=>{
    console.log("wake")
})