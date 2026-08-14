import Phaser from 'phaser';
import { DIFFICULTY_THEME } from '../config/difficulty';
import { SaveManager } from '../systems/SaveManager';

export class DifficultyScene extends Phaser.Scene {
  constructor() { super({ key: 'DifficultyScene' }); }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D1B2A, 0x0D1B2A, 0x1B2838, 0x1B2838, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, height * 0.1, 'Pilih Tingkat Kesulitan', {
      fontSize: Math.floor(width * 0.05) + 'px',
      color: '#FFD600',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const difficulties = [
      { id: 1, label: '1', title: 'Sangat Mudah', emoji: '🌱' },
      { id: 2, label: '2', title: 'Mudah',        emoji: '🌿' },
      { id: 3, label: '3', title: 'Sedang',       emoji: '🔥' },
      { id: 4, label: '4', title: 'Sulit',        emoji: '⚡' },
      { id: 5, label: '5', title: 'Sangat Sulit', emoji: '💀' },
    ];

    const cardW = Math.min(160, (width - 60) / 3);
    const cardH = cardW * 1.4;
    const cols = width < 600 ? 2 : 3;
    const rows = Math.ceil(difficulties.length / cols);

    const totalW = cols * cardW + (cols - 1) * 16;
    const startX = (width - totalW) / 2 + cardW / 2;
    const startY = height * 0.25;

    difficulties.forEach((d, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cardW + 16);
      const cy = startY + row * (cardH + 16);

      const theme = DIFFICULTY_THEME[d.id];

      const card = this.add.rectangle(cx, cy, cardW, cardH, theme.bgColor, 1)
        .setStrokeStyle(3, theme.accentColor, 1)
        .setInteractive({ useHandCursor: true });

      this.add.text(cx, cy - cardH * 0.28, d.emoji, {
        fontSize: Math.floor(cardW * 0.3) + 'px',
      }).setOrigin(0.5);

      this.add.text(cx, cy, d.label, {
        fontSize: Math.floor(cardW * 0.35) + 'px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.add.text(cx, cy + cardH * 0.32, d.title, {
        fontSize: Math.floor(cardW * 0.14) + 'px',
        color: '#ECEFF1',
      }).setOrigin(0.5);

      this.add.text(cx, cy + cardH * 0.44, theme.label, {
        fontSize: Math.floor(cardW * 0.11) + 'px',
        color: '#90A4AE',
      }).setOrigin(0.5);

      card.on('pointerover', () => {
        this.tweens.add({ targets: card, scaleX: 1.05, scaleY: 1.05, duration: 150 });
      });
      card.on('pointerout', () => {
        this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 150 });
      });
      card.on('pointerdown', () => {
        const save = SaveManager.load();
        this.scene.start('GameScene', {
          grade:      save?.grade ?? 3,
          difficulty: d.id,
          username:   save?.username ?? 'Anonim',
        });
      });
    });

    // Tombol kembali
    const backTxt = this.add.text(40, 40, '← Kembali', {
      fontSize: Math.floor(width * 0.025) + 'px',
      color: '#90CAF9',
    }).setInteractive({ useHandCursor: true });
    backTxt.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
