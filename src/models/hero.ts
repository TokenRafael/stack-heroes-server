 import { Move } from './move';

export class Hero {

  shield = false;
  shieldDuration = 0;
  health: number;

  constructor(
    public name: string,
    public image: string,
    public maxHealth: number,
    public moveset: Move[]
  ) {
    this.health = maxHealth;
  }

  damage(pwr: number): boolean {
    this.health -= pwr;
    if (this.health <= 0) this.health = 0;
    return (this.health <= 0);
  }

  heal(pwr: number): void {
    this.health = Math.min(this.health + pwr, this.maxHealth);
  }

  tick(): void {
    this.shieldDuration--;
    if (this.shieldDuration <= 0)
      this.shield = false;
  }

  buildShield(): void {
    this.shield = true;
    this.shieldDuration = 2;
  }

}

