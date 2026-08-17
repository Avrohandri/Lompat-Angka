import Phaser from 'phaser';
import { DIFFICULTY_THEME } from '../config/difficulty';
import { SaveManager } from '../systems/SaveManager';

export class DifficultyScene extends Phaser.Scene {
  constructor() { super({ key: 'DifficultyScene' }); }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x5C94FC).setOrigin(0);

    this.add.text(width / 2, height * 0.15, 'PILIH KESULITAN', {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: Math.floor(width * 0.05) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
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

    const totalW = cols * cardW + (cols - 1) * 16;
    const startX = (width - totalW) / 2 + cardW / 2;
    const startY = height * 0.25;

    difficulties.forEach((d, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cardW + 16);
      const cy = startY + row * (cardH + 16);

      const theme = DIFFICULTY_THEME[d.id];

      const card = this.add.rectangle(cx, cy, cardW, cardH, parseInt(theme.bgColor.replace('#', '0x'), 16), 1)
        .setStrokeStyle(3, theme.accentColor, 1)
        .setInteractive({ useHandCursor: true });

      this.add.text(cx, cy - cardH * 0.28, d.emoji, {
        fontSize: Math.floor(cardW * 0.3) + 'px',
      }).setOrigin(0.5);

      this.add.text(cx, cy, d.title.toUpperCase(), {
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontSize: Math.floor(cardW * 0.14) + 'px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5);

      this.add.text(cx, cy + cardH * 0.3, theme.label.toUpperCase(), {
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontSize: Math.floor(cardW * 0.1) + 'px',
        color: '#FFD600',
        stroke: '#000000',
        strokeThickness: 3,
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
    const backTxt = this.add.text(width / 2, height * 0.9, '⬅ KEMBALI KE MENU', {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: Math.floor(width * 0.025) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backTxt.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
