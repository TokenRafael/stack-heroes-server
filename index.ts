const cors_url = 'http://localhost:4200';
// Setting up and imports for express socket.io and server
const app = require('express')();
import { Request, Response } from 'express';
import cors from 'cors';
const http = require('http').createServer(app);
const io: SocketIO.Server = require('socket.io')(
  http,
  {
    cors: {
      origin: cors_url,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

// CORS config
app.use(cors());

// Project imports
import { gameHandler, getRoomName } from './src/gameHandler';
import { Move } from './src/models/move';

// Testing page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/test.html');
});

// Handle socket
io.on('connection', (socket: SocketIO.Socket) => {

  console.log(`User ${ socket.id } Connected`);

  socket.on('create', ()=>gameHandler.createGame(io, socket));
  socket.on('join', (roomId: string)=>{
    gameHandler.joinGame(io, roomId, socket);
  });
  socket.on('registerMove', (move: Move, target: number)=>gameHandler.stackMove(io, socket, move, target));
  socket.on('ready', ()=>gameHandler.readyPlayer(io, socket))

  socket.on('leaveGame', () => {
    const room = getRoomName(socket);
    socket.leave(room);
    gameHandler.deleteGame(room);
  });
  socket.on('disconnecting', () => {
    const room = getRoomName(socket);
    socket.to(room).emit('win');
  });
  socket.on('disconnect', () => {
    console.log(`User ${ socket.id } disconnected`);
  })
});

// Starting server by listening
http.listen(9000, () => {
  console.info('Server listening @ http://localhost:9000');
});
