const express = require('express');
const socket = require('socket.io');
const http = require('http');
const {Chess} = require('chess.js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players = {};
let currentPlayer="w";
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index',{title:"Chess Game"});
})

io.on("connection",(socket)=>{
    console.log("connected")
    
    if(!players.white){
        players.white = socket.id;
        socket.emit("playerRole","w")

    }
    else if(!players.black){
        players.black = socket.id;
        socket.emit("playerRole","b")
    }
    else {
        socket.emit("spectatorRole")
    
    }

    socket.on("move",(move)=>{
        try{
          if(chess.turn()==="w" && socket.id!==players.white){
              return;
          }
          if(chess.turn()==="b" && socket.id!==players.black){
              return;
          }
         const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                console.log("currentPlayer---",currentPlayer)
                io.emit("move",move);
                io.emit("boardState",chess.fen());
            } else{
                console.log("invalid move : ",move)
                //send invalid move to the particular client
                socket.emit("invalidMove",move)
            }
        } catch(err){
            console.log(err)
            console.log("invalid move : ",move)
            socket.emit("invalidMove",move)
        }
    })


    socket.on("disconnect",()=>{
        console.log("disconnected")
        if(socket.id===players.white ){
            delete players.white;
        } else if(socket.id===players.black){
            delete players.black;
        }
    })
})

server.listen(8080, () => {
    console.log('Server is running on port 8080');
})