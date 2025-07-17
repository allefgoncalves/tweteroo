import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb"; 

//const mongoClient = new MongoClient(process.env.DATABASE_URL);
const mongoClient = new MongoClient('mongodb://localhost:27017/tweetero');
let db;
const users = [];
const tweets = [];

mongoClient.connect()
  .then(() => {
    db = mongoClient.db("tweteroo");
    console.log("Conectado ao banco de dados");
  })
  .catch((err) => console.log("Erro ao conectar:", err.message));

const app = express(); 
app.use(cors());
app.use(express.json());

app.post('/sign-up', (req, res)=>{
    const{ username, avatar }=req.body;

    if( !username || !avatar ){
        res.status( 422 ).send("Todos os campos devem ser preenchidos!");
        return;
    }

    db.collection("users").insertOne({ username, avatar })    
        .then(() => res.status(201).send("Ok"))
        .catch(err => res.status(500).send(err.message))
});

app.post('/tweets', (req, res)=>{
    const{ username, tweet }=req.body;

    if( !username || !tweet ){
        res.status( 422 ).send("Todos os campos devem ser preenchidos!");
        return;
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

app.listen(5000, () => console.log('App Servidor executando na porta 5000'));