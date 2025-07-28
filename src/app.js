import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId, } from "mongodb"; 
import dotenv from "dotenv";
import joi from 'joi';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;  
const mongoClient = new MongoClient(DATABASE_URL);

let db;
const users = [];           
const tweets = [];

mongoClient.connect()
  .then(() => {
    db = mongoClient.db();
    console.log("Conectado ao banco de dados");
  })
  .catch((err) => console.log("Erro ao conectar:", err.message));

const app = express(); 
app.use(cors());
app.use(express.json());

app.post('/sign-up', (req, res)=>{
    const{ username, avatar }=req.body;

     const tweets = joi.object({
        username: joi.string().required(),
        avatar: joi.string().required()
    });

    const validation = tweets.validate({ username, avatar },{ abortEarly: false });
    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    db.collection("users").insertOne({ username, avatar })    
        .then(() => res.status(201).send("Ok"))
        .catch(err => res.status(500).send(err.message))
});

app.post('/tweets', (req, res)=>{
    const{ username, tweet }=req.body;

    const tweets = joi.object({
        username: joi.string().required(),
        tweet: joi.string().required()
    });

    const validation = tweets.validate({ username, tweet },{ abortEarly: false });
    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    db.collection("tweets").insertOne({ username, tweet })    
        .then(() => res.status(201).send("Ok"))
        .catch(err => res.status(500).send(err.message))
});

app.get("/tweets",(req, res)=>{
    db.collection("tweets").find().toArray()
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err.message))
});

app.get("/users",(req, res)=>{
    db.collection("users").find().toArray()
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err.message))
});

app.get("/tweets/:id",(req, res)=>{
    const { id } = req.params;
    console.log(id); 
    db.collection("tweets").findOne({ _id: new ObjectId(id) })
		.then((data) => {
			console.log(data);
            return res.send(data);
		})
		.catch(() => {
			return res.status(404).send(err);
		})
});

const PORT = process.env.PORT;   
app.listen(PORT, () => console.log(`App Servidor executando na porta ${PORT}`));