const http = require('http');
const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

let users = [];
let messages = [];

// Define callback functions
function handleConnection(ws) {
  console.log('New client connected');

  ws.on('message', (data) => handleMessage(ws, data));
  ws.on('close', () => handleClose(ws));
}

function handleMessage(ws, data) {
  const parsedData = JSON.parse(data);
  console.log('Received message:', parsedData);

  switch (parsedData.type) {
    case 'login':
      handleLogin(ws, parsedData.username);
      break;

    case 'message':
      handleUserMessage(ws, parsedData.message);
      break;

    case 'get_history':
      handleGetHistory(ws);
      break;

    default:
      console.log('Unknown message type:', parsedData.type);
  }
}

function handleLogin(ws, username) {
  ws.username = username;
  users = Array.from(wss.clients)
    .map(client => client.username)
    .filter(Boolean);
  broadcast({
    type: 'update_users',
    users,
  });
}

function handleUserMessage(ws, message) {
  const timestamp = new Date().toISOString();
  messages.push({
    user: ws.username,
    message,
    timestamp,
  });
  broadcast({
    type: 'message',
    user: ws.username,
    message,
    timestamp,
  });
}

function handleGetHistory(ws) {
  ws.send(JSON.stringify({
    type: 'history',
    messages,
  }));
}

function handleClose(ws) {
  console.log('Client disconnected');
  users = Array.from(wss.clients)
    .map(client => client.username)
    .filter(Boolean);
  broadcast({
    type: 'update_users',
    users,
  });
}

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Set up WebSocket server
wss.on('connection', handleConnection);

// Serve static files from the public directory
app.use(express.static('public'));

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
