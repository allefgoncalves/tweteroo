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

app.get("/tweets", async (req, res) => {
  try {
    const tweets = await db.collection("tweets").find().sort({ _id: -1 }).toArray();

    const tweetsComAvatar = await Promise.all(tweets.map(async (tweet) => {
      const user = await db.collection("users").findOne({ username: tweet.username });
      return {
        _id: tweet._id,
        username: tweet.username,
        avatar: user?.avatar || "",
        tweet: tweet.tweet
      };
    }));

    res.send(tweetsComAvatar);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/users",(req, res)=>{
    db.collection("users").find().toArray()
        .then(data => res.send(data))
        .catch(err => res.status(500).send(err.message))
});

app.get("/tweets/:id",(req, res)=>{
    const { id } = req.params;

    db.collection("tweets").findOne({ _id: new ObjectId(id) })
		.then((data) => {
			console.log(data);
            return res.send(data);
		})
		.catch(() => {
			return res.status(404).send(err);
		})
});

app.delete('/tweets/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const resutado = await db.collection("tweets").deleteOne({ _id: new ObjectId(id) });
        if(resutado.deletedCount == 0 ){
            return res.status(404).send("não foi encontrado");
        }
        return res.status(204).send("deletado com sucesso");
    } catch (err){
        res.status(500).send(err.message);
    }
});

app.put('/tweets/:id', async (req, res)=>{
    const { id } = req.params;
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

    try{
        const existencia = await db.collection("tweets").findOne({ _id: new ObjectId(id) });
        if (!existencia) {
            return res.status(404).send("tweet não encontrado");
        }
        
        await db
        .collection("tweets")
        .updateOne({ _id: new ObjectId(id) },{ $set:{ username, tweet }});

        return res.status(204).send("tweet atualizado");
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT;   
app.listen(PORT, () => console.log(`App Servidor executando na porta ${PORT}`));