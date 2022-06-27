import express, { json } from "express";
import cors from "cors"
import dotenv from "dotenv"
import joi from "joi"
import { MongoClient, ObjectId } from "mongodb";
import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";

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
    name: joi.string().alphanum().min(1).required(),
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
  return;

});


app.get("/participants", async (req, res) => {
  try {
    const allParticipant = db.collection("participants").find().toArray()
    res.send(allParticipant);
    mongoClient.close();
  } catch (error) {
    res.send(404);
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
    }

    await db.collection("messages").insertOne({
      from: user.name,
      to,
      text,
      type,
      time: dayjs().format("HH:mm:ss"),
    });
    res.sendStatus(201);
    return;

  } catch (e) {
    console.log(e)
  }
})

app.get("messages", async (req, res) => {
  const limit = parseInt(req.query.limit)
  const user = req.headers.user
  let arrAux = []
  try {
    const messages = await db.collection("messages").find().toArray()
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].type === "private_message" && (messages[i].to === user || messages[i].from === user)) {
        arrAux.push(messages[i]);
      }
      if (messages[i].type === "message" || messages[i].type === "status") {
        arrAux.push(messages[i]);
      }
    }
    if (!limit) {
      return res.send(arrAux)
    }

    let reverseMessages = [...arrAux].reverse()
    let limitMessages = reverseMessages.splice(0, limit)
    res.send(limitMessages)

  } catch (e) {
    console.log(e)
  }

})

app.status("/status", async (req, res) => {
  const user = req.headers.user
  try {
    const findUser = await db.collection("participants").findOne({ user });
    if (!findUser) {
      res.sendStatus(404)
      return
    }
    await db.collection("participants").updateOne({ name: user },
      { $set: { lastStatus: Date.now() } });
    res.sendStatus(200);
    return;
  } catch (e) {
    res.send(422).send("desculpe", e);
    mongoClient.close();
  }


  async function VerifyLastStatus() {
    try {
      const arrParticipants = await db.collection("participants").find().toArray()
      for (let i = 0; i < arrParticipants.length; i++) {
        if (arrParticipants[i].lastStatus > 10000) {
          await db.collection('participants').deleteOne({ _id: new ObjectId(participants[i]._id) });
          messagesArray.insertOne(
            {
              from: arrParticipants[i].name,
              to: 'Todos',
              text: 'sai da sala...',
              type: 'status',
              time: dayjs().format("HH:mm:ss")
            }
          )
        }
      }
    } catch (e) { console.log(e) }
  }
  setInterval(VerifyLastStatus, 15000)

  app.delete("/messages/:id", async (req, res) => {
    const user = req.headers.user
    const { id } = req.params
    try {
      const messageId = await db.collection("messages").findOne({ _id: new ObjectId(id) })
      if (!messageId) {
        res.sendStatus(404)
        return
      }
      if (user !== messageId.from) {
        res.sendStatus(401);
        return;
      }
      await db.collection("messages").deleteOne({ _id: new ObjectId(id) });
    } catch (e) { }

  })

  app.put("/messages/:id", async (req, res) => {
    const { to, type, text } = req.body
    const user = req.headers.user
    const { id } = req.params

    const schemaMessage = joi.object({
      to: joi.string().required(),
      text: joi.string().required(),
      type: joi.string().allow('message', 'private_message'),
    })
    const validateMessage = schemaMessage.validate({ to, type, text }, { abortEarly: false });
    if (validateMessage.error) {
      res.sendStatus(422);
      return;
    }
    try {
      const findUser = await db.collection("participants").findOne({ name: user })
      if (!findUser) {
        res.sendStatus(422);
        return;
      }
      const messageId = await db.collection("messages").findOne({ _id: new ObjectId(id) })
      if (user !== messageId.from) {
        res.sendStatus(401);
        return;
      }
      if (!messageId) {
        res.sendStatus(404)
        return;
      }
      await db.collection("messages").updateOne(
        { _id: messageId._id, },
        {
          $set: {
            from,
            to,
            type,
            text,
            time: dayjs().format("HH:mm:ss")
          }
        }
      )

    } catch (e) { console.log(e) }
  })
})


app.listen(5000, () => {
  console.log("wake")
})