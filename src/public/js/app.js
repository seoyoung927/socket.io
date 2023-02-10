const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form");
const room  = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    console.log(message);
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessgeSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message",input.value,roomName,()=>{
        addMessage(`You: ${value}`);
    });
    input.value="";
}

function handleNickNameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname",input.value);
    input.value="";
}
function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText=`Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit",handleMessgeSubmit);
    const nameForm = room.querySelector("#name");
    nameForm.addEventListener("submit",handleNickNameSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom); //==socket.send, 1st argument: event 이름, 2nd argument: 보내고 싶은 payload, 3rd argument: 서버에서 호출하는 func
    roomName = input.value;
    input.value="";
}

form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome", (user)=>{
    addMessage(`${user} joined!`);
});
socket.on("bye",(left)=>{
    addMessage(`${left} leftㅠㅠ`);
})
socket.on("new_message",addMessage);
