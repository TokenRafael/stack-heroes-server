import { Move } from "./move";
import { Timer } from "./timer";

interface Action {
  move: Move;
  sender: string;
  target: number;
}

export class Game {

  gameTimer: Timer;
  moveStack: Action[] = [];

  p1moves = 0;
  p2moves = 0;
  p1ready = false;
  p2ready = false;

  p2: SocketIO.Socket;

  constructor (
    public io: SocketIO.Server,
    public roomName: string,
    public p1: SocketIO.Socket
  ) {
    this.gameTimer = new Timer(io, roomName);
    this.p1ready = true;
  }

  registerPlayer(p: SocketIO.Socket) {
      this.p2 = p
      p.join(this.roomName);
      this.p2ready = true;
      this.io.to(this.roomName).emit('startGame');
      this.gameTimer.start();
  }

  playersReady(): boolean {
    return this.p1ready && this.p2ready;
  }

  setPlayerReady(p: SocketIO.Socket): void {
    if (p === this.p1) {
      this.p1ready = true;
      console.log('P1 ready');
    }
    if (p === this.p2) {
      this.p2ready = true;
      console.log('P2 ready');
    }
    if (this.playersReady()) {
      this.io.to(this.roomName).emit('startGame');
      this.gameTimer.start();
    }
  }

  pushMove(p: SocketIO.Socket, m: Move, target: number): void {
    if (this.playersReady()) {
      let sender = '';
      if (p === this.p1) {
        sender = 'p1';
        if (this.p1moves === 3) {
          p.emit('error', 'No more moves available to you');
          return;
        } else
          this.p1moves++;
      }
      if (p === this.p2) {
        sender = 'p2';
        if (this.p2moves === 3) {
          p.emit('error', 'No more moves available to you');
          return;
        } else
          this.p2moves++;
      }
      this.moveStack.push({
        move: m,
        sender: sender,
        target: target
      });
      if (this.moveStack.length === 6) this.completeRound();
      console.log(this.moveStack);
    } else
        p.emit('error', 'Waiting for all players to be ready');
  }

  completeRound(): void {
    this.io.to(this.roomName).emit('actionStack', this.moveStack);
    this.moveStack = [];
    this.p1ready = this.p2ready = false;
    this.gameTimer.stop();
  }


}
