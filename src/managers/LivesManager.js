export class LivesManager {
  constructor() {
    this.lives = 3;
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    return this.lives;
  }

  isDead() {
    return this.lives === 0;
  }
}
