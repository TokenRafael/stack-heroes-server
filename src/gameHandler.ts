import { Game } from './models/game';
import shortid from 'shortid';
import { Move } from './models/move';

let games: Game[] = [];

export function getRoomName(socket: SocketIO.Socket) {
  const it = (socket.rooms as any).values();
  it.next();
  return it.next().value;
}

export const gameHandler = {
  createGame(io: SocketIO.Server, socket: SocketIO.Socket): void {
    const roomCheck = getRoomName(socket);
    if (roomCheck !== undefined) socket.leave(roomCheck);
    const roomId = shortid.generate();
    console.log('Creating room ' + roomId);
    socket.join(roomId);
    const newGame = new Game(io, roomId, socket);
    games.push(newGame);
    socket.emit('return:roomId', roomId);
  },
  joinGame(io: SocketIO.Server, roomId: string, socket: SocketIO.Socket): void {
    const foundGame = (games.find(g => g.roomName === roomId));
    if ( foundGame === undefined) {
      socket.emit('error', 'Invalid room ID');
    } else {
      foundGame.registerPlayer(socket);
    }
  },
  stackMove(io: SocketIO.Server, socket: SocketIO.Socket, move: Move, target: number): void {
    const room = getRoomName(socket);
    if (room === undefined) {
      socket.emit('error', 'Invalid room ID');
    } else {
      const foundGame = games.find(g => g.roomName === room);
      foundGame?.pushMove(socket, move, target);
    }
  },
  readyPlayer(io: SocketIO.Server, socket: SocketIO.Socket): void {
    const room = getRoomName(socket);
    if (room === undefined)
      socket.emit('error', 'Invalid room ID');
    else {
      const foundGame = games.find(g => g.roomName === room);
      foundGame?.setPlayerReady(socket);
    }
  },
  deleteGame(roomName: string): void {
    games = games.filter(game => game.roomName !== roomName);
  }
}
