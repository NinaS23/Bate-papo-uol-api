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



const schemaNameValidate = joi.object({
    name:joi.string().alphanum().required(),
})

app.post("/participants", async (req, res) => {
    const { name } = req.body;
  
    const schemaNameValidate= joi.object({
      name: joi.string().min(1).required(),
    });
  
    const validateName = schemaNameValidate.validate({ name });
  
    if (validateName.error) {
      res.sendStatus(422);
      return;
    }
  
    try {
      const user = await database.collection("participants").findOne({ name });
      console.log(user)
  
      if (user) {
        res.sendStatus(409);
        return;
      } else {
        await db .collection("participants") .insertOne({ name, lastStatus: Date.now() });
        db.collection("participants").find().toArray().then(users => {
            console.log(users); 
        });

        await database.collection("messages").insertOne({
          from: name,
          to: "Todos",
          text: "entra na sala...",
          type: "status",
          time: dayjs().format("HH:mm:ss"),
        });
      }
    } catch (e) {
      console.log(e);
    }
    res.sendStatus(201);
  });
  

app.get("/participants" , async (req,res)=>{
    try{
        let participants = await mongoClient.db.collection("participants").find().toArray();
        console.log(participants)
        res.status(200).send(participants);
    }catch(e){
        res.status(404).send("desculpe, mas não conseguimos achar o participante");
        mongoClient.close();
    }
})

app.listen(5000 , ()=>{
    console.log("wake")
})