// ScoreSystem — skor, combo, bintang

export interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
  correct: number;
  wrong: number;
  stars: number;
}

const BASE_SCORE = 100;

export class ScoreSystem {
  private state: ScoreState = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    correct: 0,
    wrong: 0,
    stars: 0,
  };

  onCorrect(speedRatio: number = 1): number {
    this.state.combo++;
    this.state.correct++;
    if (this.state.combo > this.state.maxCombo) {
      this.state.maxCombo = this.state.combo;
    }

    const multiplier = Math.min(this.state.combo, 5); // cap x5
    const bonus = 1 + Math.min(speedRatio, 1) * 0.5;  // 1.0–1.5×
    const gained = Math.round(BASE_SCORE * multiplier * bonus);
    this.state.score += gained;
    return gained;
  }

  onWrong(): void {
    this.state.combo = 0;
    this.state.wrong++;
  }

  calcStars(): number {
    const total = this.state.correct + this.state.wrong;
    const accuracy = total === 0 ? 1 : this.state.correct / total;

    if (accuracy >= 0.9 && this.state.maxCombo >= 3) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  }

  getState(): Readonly<ScoreState> {
    return { ...this.state };
  }

  reset(): void {
    this.state = { score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, stars: 0 };
  }
}
