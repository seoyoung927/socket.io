import http from "http";
import express from "express";
import WebSocket from "ws";

const app = express(); //http를 다룸

app.set("view engine","pug");
app.set("views",__dirname+"/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(_,res)=>res.render("home"));
app.get("/*",(_,res)=>res.redirect("/"));

const hanldeListen = () => console.log(`'Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({server}); //http 서버위에 webSocket 서버를 만들 수 있도록 한 것

const sockets = [];

wss.on("connection",(socket)=>{
    sockets.push(socket);
    socket["nickname"]="Anon";
    console.log("Connected to Browser ✔");
    socket.on("close",()=>console.log("Disconnected from the Browser ✖"));
    socket.on("message",(message)=>{
        const parsed = JSON.parse(message);
        switch(parsed.type){
            case "new_message":
                sockets.forEach(aSocket=>aSocket.send(`${socket.nickname}: ${parsed.payload}`));
            case "nick_name":
                socket["nickname"] = message.payload; //socket은 기본적으로 객체이다.
        }
    });
});

server.listen(3000,hanldeListen);
