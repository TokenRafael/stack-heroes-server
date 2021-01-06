export class Timer {
  time = 40;
  intervalLoop: NodeJS.Timeout;

  constructor(
    public io: SocketIO.Server,
    private room: string
  ) { }

  start(): void {
    this.intervalLoop = setInterval(() => {
      if (this.time > 0)
        this.io.to(this.room).emit('timerCount', this.time);
      else {
        this.io.to(this.room).emit('timerOut');
        clearInterval(this.intervalLoop);
      }
      this.time--;
    }, 1000);
  }

  stop(): void {
    clearInterval(this.intervalLoop);
    this.time = 40;
  }
}
