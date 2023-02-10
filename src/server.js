import http from "http";
import express from "express";
import SocketIO from "socket.io";
const app = express(); //http를 다룸

app.set("view engine","pug");
app.set("views",__dirname+"/views");
app.use("/public",express.static(__dirname+"/public"));
app.get("/",(_,res)=>res.render("home"));
app.get("/*",(_,res)=>res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms(){
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_,key)=>{
        if(sids.get(key)===undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection",socket=>{
    socket["nickname"]="Anon";
    socket.onAny((event) => { 
        console.log(`Socket Event: ${event}`);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));
        wsServer.sockets.emit("room_change",publicRooms());
    });
    socket.on("disconnecting",()=>{
        socket.rooms.forEach((room)=>
            socket.to(room).emit("bye",socket.nickname,countRoom(room) - 1)
        );
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnet",()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname",nickname=>{
        socket["nickname"]=nickname;
    })
});
// const wss = new WebSocket.Server({server}); //http 서버위에 webSocket 서버를 만들 수 있도록 한 것

// const sockets = [];

// wss.on("connection",(socket)=>{
//     sockets.push(socket);
//     socket["nickname"]="Anon";
//     console.log("Connected to Browser ✔");
//     socket.on("close",()=>console.log("Disconnected from the Browser ✖"));
//     socket.on("message",(message)=>{
//         const parsed = JSON.parse(message);
//         switch(parsed.type){
//             case "new_message":
//                 sockets.forEach(aSocket=>aSocket.send(`${socket.nickname}: ${parsed.payload}`));
//             case "nick_name":
//                 socket["nickname"] = message.payload; //socket은 기본적으로 객체이다.
//         }
//     });
// });

const handleListen = () => console.log(`'Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);
