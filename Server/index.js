const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const { type } = require('os');

const app = express();
const port = 3000;
const server = http.createServer(app);
const clients = new Map();
const wss = new WebSocket.Server({ server });
let users ={};
let chatHistory = [];
wss.on('connection',(ws)=>{
    console.log("New Client Connected");
    ws.send(JSON.stringify({type:'chatHistory',chatHistory})) //chat history
    ws.on('message',(message)=>{
        const parsedMessage = JSON.parse(message);
        switch(parsedMessage.type){
            case 'username':
                users[parsedMessage.username]=ws;
                
                broadcastUsers();
                break;
            case 'typing':
                 broadcastTyping(parsedMessage.username);
                 break;
            case 'chat':
                const chatMessage = {username:parsedMessage.username, message:parsedMessage.message, timestamp:new Date().toISOString()}
                chatHistory.push(chatMessage);
                broadcastChat(chatMessage);
                break;
        }
    });
    ws.on('close',()=>{
        for(let username in users){
            if(users[username]===ws){
                delete users[username]; //delete user in online 
                break;

            }
        }
        broadcastUsers();
        console.log(`Client Disconnected `);
        
    });
    
});







function broadcastUsers(){
    const usernames = Object.keys(users);
    wss.clients.forEach(client=>{
        if(client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify({type:'users',users:usernames}))
            client.send(JSON.stringify({type:'notification',message:`new user joined the chat`}))
        }
    });
}
function broadcastTyping (username){
    wss.clients.forEach(client=>{
        if(client.readyState===WebSocket.OPEN){
            client.send(JSON.stringify({type:'typing',username}))
        }
    })
}
function broadcastChat(chatMessage){
 wss.clients.forEach(client=>{
    if(client.readyState===WebSocket.OPEN){
        client.send(JSON.stringify({type:'chat',...chatMessage}))
    }
 });
}
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});