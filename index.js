import express , {json} from "express";
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"
import { MongoClient } from "mongodb";
import dayjs from "dayjs";

dotenv.config();
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



app.post("/participants", async (req, res) => {
  const { name } = req.body;

  const schemaNameValidate = joi.object({
    name: joi.string().required(),
  });

  const validateName = schemaNameValidate.validate({ name });

  if (validateName.error) {
    res.sendStatus(422);
    return;
  }

  try {

    const user = await db.collection("participants").findOne({ name });
    db.collection("participants").find().toArray().then(users => {
      console.log(users);
    });
    console.log(user)

    if (user) {
      res.sendStatus(409);
      return;

    } else {
      await db.collection("participants").insertOne({ name, lastStatus: Date.now() });
      db.collection("participants").find().toArray().then(users => {
        console.log(users);
      });

      await db.collection("messages").insertOne({
        from: name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: dayjs().format("HH:mm:ss"),
      });
    }
  } catch (e) {
    console.log(e);
    mongoClient.close()
  }
  res.sendStatus(201);
  mongoClient.close()
});


app.get("/participants", async (req, res) => {

  try {
    const allParticipant = db.collection("participants").find().toArray()
    res.status(200).send(allParticipant);
    mongoClient.close();
  } catch (error) {
    res.send(404).send("desculpe, mas não conseguimos achar o participante");
    mongoClient.close();
  }

})
app.post("messages", async (req, res) => {
  const { to, text, type } = req.body
  const participant = req.header.user;

  const schemaMessage = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().allow('message', 'private_message'),
  })

  const validateMessage = schemaMessage.validate({ to, type, text }, { abortEarly: false });
  if (!validateMessage) {
    return res.send(422);
  } else {
    sendStatus(422).send("xabu", error)
  }

  try {
    const user = db.collection("participants").findOne({ participant })
    if (!user) {
      res.sendStatus(422);
      return;
    } else {
      await database.collection("messages").insertOne({
        from: user.name,
        to,
        text,
        type,
        time: dayjs().format("HH:mm:ss"),
      });
      res.sendStatus(201);
    }

  } catch (e) {
    console.log(e)
  }
})

app.get("messages", async (req, res) => {
  const limit = parseInt(req.query.limit)
  const user = req.headers.user
  let arrAux = []
  try {
    const messages = await db.collection("messages").find({}).toArray()
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].to === user || messages[i].from === user) {
        arrAux.push(messages[i])
      }
    }
    if (!limit) {
     return res.send(arrAux)
    } else {
      let reverseMessages = [...arrAux].reverse()
      let limitMessages = reverseMessages.splice(0, limit)
      res.send(limitMessages)
    }
  } catch (e) {
    console.log(e)
  }

})


app.listen(5000 , ()=>{
    console.log("wake")
})