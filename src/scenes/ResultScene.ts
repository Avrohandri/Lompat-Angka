import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';

export class ResultScene extends Phaser.Scene {
  constructor() { super({ key: 'ResultScene' }); }

  init(data: {
    score: number;
    stars: number;
    correct: number;
    wrong: number;
    maxCombo: number;
    grade: number;
    difficulty: number;
  }): void {
    this.data.set(data);
  }

  create(): void {
    const { width, height } = this.scale;
    const score    = this.data.get('score') as number;
    const stars    = this.data.get('stars') as number;
    const correct  = this.data.get('correct') as number;
    const wrong    = this.data.get('wrong') as number;
    const maxCombo = this.data.get('maxCombo') as number;
    const grade    = this.data.get('grade') as number;
    const diff     = this.data.get('difficulty') as number;

    // BG
    this.add.rectangle(0, 0, width, height, 0x5C94FC).setOrigin(0);

    // Title
    this.add.text(width / 2, height * 0.1, 'HASIL', {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: Math.floor(width * 0.07) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Stars
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    this.add.text(width / 2, height * 0.22, starStr, {
      fontSize: Math.floor(width * 0.08) + 'px',
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height * 0.34, `SKOR: ${score}`, {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: Math.floor(width * 0.06) + 'px',
      color: '#FFD600',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Stats
    const total    = correct + wrong;
    const accuracy = total === 0 ? 100 : Math.round((correct / total) * 100);
    const stats = [
      `BENAR: ${correct}`,
      `SALAH: ${wrong}`,
      `AKURASI: ${accuracy}%`,
      `COMBO TERTINGGI: x${maxCombo}`,
    ];
    stats.forEach((s, i) => {
      this.add.text(width / 2, height * 0.46 + i * (height * 0.07), s, {
        fontFamily: GAME_CONSTANTS.FONT_FAMILY,
        fontSize: Math.floor(width * 0.032) + 'px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5);
    });

    // High score display
    const save = SaveManager.load();
    if (save) {
      this.add.text(width / 2, height * 0.74, `SKOR TERTINGGI: ${save.highScore}`, {
        fontFamily: GAME_CONSTANTS.FONT_FAMILY,
        fontSize: Math.floor(width * 0.028) + 'px',
        color: '#FFD600',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5);
    }

    // Buttons
    const btnY = height * 0.86;
    const btnSpacing = Math.min(180, width * 0.32);
    this.makeButton(width / 2 - btnSpacing, btnY, 'ULANGI', 0x1565C0, () => {
      this.scene.start('GameScene', {
        grade, difficulty: diff,
        username: save?.username ?? 'Anonim',
      });
    });
    this.makeButton(width / 2 + btnSpacing, btnY, 'MENU', 0x37474F, () => {
      this.scene.start('MenuScene');
    });

    // Celebrate animation
    this.time.addEvent({
      delay: 100,
      repeat: stars * 3 - 1,
      callback: () => {
        const x = Phaser.Math.Between(width * 0.2, width * 0.8);
        const y = Phaser.Math.Between(height * 0.1, height * 0.5);
        const colors = [0xFFD600, 0x69F0AE, 0xFF5252, 0x40C4FF];
        const dot = this.add.circle(x, y, 8, Phaser.Utils.Array.GetRandom(colors));
        this.tweens.add({
          targets: dot, y: y + 60, alpha: 0, duration: 600,
          onComplete: () => dot.destroy(),
        });
      },
    });
  }

  private makeButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const { width } = this.scale;
    const btnW = Math.min(160, width * 0.28);
    const btnH = 52;

    const bg = this.add.rectangle(x, y, btnW, btnH, color)
      .setStrokeStyle(2, 0xFFFFFF, 0.4)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: Math.floor(width * 0.025) + 'px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setAlpha(0.8));
    bg.on('pointerout',  () => bg.setAlpha(1));
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true });
      this.time.delayedCall(160, onClick);
    });
  }
}
