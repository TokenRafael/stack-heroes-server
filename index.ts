import { config as dotconf } from 'dotenv'
dotconf();
const cors_url = process.env.CORS_URL;
// Setting up and imports for express socket.io and server
const app = require('express')();
import { Request, Response } from 'express';
import cors from 'cors';
const http = require('http').createServer(app);
const io: SocketIO.Server = require('socket.io')(http, {
  cors: {
    origin: cors_url,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CORS config
app.use(cors());

// Project imports
import { gameHandler, getRoomName } from './src/gameHandler';
import { Move } from './src/models/move';
import { Hero } from './src/models/hero';

// Testing page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/test.html');
});

// Handle socket
io.on('connection', (socket: SocketIO.Socket) => {
  console.log(`User ${socket.id} Connected`);

  socket.on('create', (team: Hero[]) =>
    gameHandler.createGame(io, socket, team)
  );
  socket.on('join', (roomId: string, team: Hero[]) => {
    gameHandler.joinGame(io, roomId, socket, team);
  });
  socket.on('registerMove', (move: Move, sender: number, target: number) =>
    gameHandler.stackMove(io, socket, move, sender, target)
  );
  socket.on('ready', () => gameHandler.readyPlayer(io, socket));
  socket.on('lost', () => {
    const room = getRoomName(socket);
    socket.to(room).emit('win');
    socket.emit('lose')
  })

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
    console.log(`User ${socket.id} disconnected`);
  });
});

// Starting server by listening
http.listen(9000, () => {
  console.info('Server listening @ http://localhost:9000');
});
