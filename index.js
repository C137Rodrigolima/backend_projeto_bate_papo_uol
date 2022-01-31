import express, { json } from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    
    db = mongoClient.db("bate_papo_uol");
  });

const server = express();
server.use(cors());
server.use(json());

server.post("/participants", async (req,res)=>{
    const participant = req.body;
    console.log(participant);

    const participantSchema = joi.object({
        name: joi.string().required()
    });
    const participantValidation = participantSchema.validate(participant, { abortEarly: false });

    if (participantValidation.error) {
    console.log(participantValidation.error.details);
    res.sendStatus(422);
    return;
    }

    try{
        const mycollection = await db.collection('participants');

        const sameName = await mycollection.findOne({ name: participant.name });
        if(sameName){
            res.sendStatus(409);
            return;
        }

        mycollection.insertOne(
            {name: participant.name, lastStatus: Date.now()}
        );

        await db.collection('messages').insertOne({
            from: participant.name, to: 'Todos', text: 'entra na sala...', 
            type: 'status', time: dayjs().format("HH:mm:ss")
        });

        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(500);
        console.log(error);
    }
});

server.get("/participants", async (req,res)=>{
    try {
        const collectionAllParticipants = await db.collection('participants').find({}).toArray();
        res.send(collectionAllParticipants);
    } catch (error) {
        res.sendStatus(500);
        console.log(error);
    }
});

server.post("/messages", async (req,res)=>{
    const message = req.body;
    const user = req.headers.user;
    console.log(message, user);

    const messageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().valid("message", "private_message").required()
    });
    const userSchema = joi.string().required();
    const messageValidation = messageSchema.validate(message, { abortEarly: false });
    const userValidation = userSchema.validate(user, { abortEarly: false });
    if (messageValidation.error) {
        console.log(messageValidation.error.details);
        res.sendStatus(422);
        return;
    } else if (userValidation.error) {
        console.log(userValidation.error.details);
        res.sendStatus(422);
        return;
    }

    try{
        await db.collection('messages').insertOne({
            from: user,
            to: message.to,
            text: message.text,
            type: message.type,
            time: dayjs().format("HH:mm:ss")
        });

        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

server.get("/messages", async (req,res)=>{
    //const limit = parseInt(req.query.limit);
    try {
        const allMessages = await db.collection('messages').find({}).toArray();
        console.log(allMessages);
        res.send(allMessages);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

server.post("/status", (req,res)=>{
    
    try {
        console.log("Post de Status em funcionamento...");
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


server.listen(5000, ()=>{
    console.log("Server initiate on port 5000");
});