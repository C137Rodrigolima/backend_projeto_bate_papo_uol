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

server.post("/messages", (req,res)=>{
    try {
        console.log("Post de mensagens em funcionamento...");
        res.sendStatus(200);
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

server.get("/messages", (req,res)=>{
    try {nsole.log("Get de mensagens em funcionamento...");
    res.sendStatus(200);

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