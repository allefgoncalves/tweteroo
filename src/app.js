import express from 'express';
import cors from 'cors';

const app = express(); 
app.use(cors());
app.use(express.json());

const users=[];
const tweets=[];

app.post('/sign-up', (req, res)=>{
    console.log(req);
    const { username, avatar } = req.body;

    if ( !username || !avatar ){
        res.status( 422 ).send("Todos os campos devem ser preenchidos!");
        return;
    }

    const novo = {
        id: users.length + 1,
        username: username,
        avatar: avatar
    }

    users.push(novo);  

    res.status(201).send(novo);

});

app.post('/tweets', (req, res)=>{
    
    const { username, tweet } = req.body;

    if ( !username || !tweet ){
        res.status( 422 ).send("Todos os campos devem ser preenchidos!");
        return;
    }

    const result = users.filter( user => user.username === username );

    if( !result ){
        res.status(409).send("UNAUTHORIZED"); 
        return;
    }

    const novo = {
        id: users.length + 1,
        username: username,
        tweet: tweet
    }

    tweets.push(novo);  

    tweets.status(201).send("Ok");

});

app.get("/tweets", (req, res) => {

    if(tweets.length==0){
        res.send(tweets);
        return;
    }

    const msg = {
        username:"",
        avatar:"",
        tweet:""
    }

    const resposta=[];

    for(let i=tweets.length; i>=0; i--){
        msg.username = tweets[i].username;
        msg.tweet = tweets[i].tweet;
        const user = users.filter( user => user.username === tweets[i].username );
        msg.avatar = user.avatar;
        resposta.push(msg);
    } 

    res.status(200).send(resposta);
});

app.listen(5000, () => console.log('App Servidor executando na porta 5000'));