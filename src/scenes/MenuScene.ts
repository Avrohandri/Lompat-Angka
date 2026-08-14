import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { GRADE_CONFIG } from '../config/grades';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveManager.load();

    // ── Background gradient ─────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0D1B2A, 0x0D1B2A, 0x1B4F72, 0x1B4F72, 1);
    bg.fillRect(0, 0, width, height);

    // ── Stars parallax deco ─────────────────────────────────────────
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height * 0.7);
      const r = Phaser.Math.FloatBetween(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      this.add.circle(x, y, r, 0xFFFFFF, alpha);
    }

    // ── Title ───────────────────────────────────────────────────────
    this.add.text(width / 2, height * 0.2, '🔢 LOMPAT ANGKA', {
      fontSize: Math.floor(width * 0.08) + 'px',
      color: '#FFD600',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { blur: 20, color: '#FFD600', fill: true },
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.3, 'Lari • Hitung • Menang!', {
      fontSize: Math.floor(width * 0.035) + 'px',
      color: '#B0BEC5',
    }).setOrigin(0.5);

    // ── Tombol Mulai ─────────────────────────────────────────────────
    const btnY = save ? height * 0.5 : height * 0.55;
    this.makeButton(width / 2, btnY, '▶  MULAI BERMAIN', 0x2E7D32, 0x43A047, () => {
      if (save) {
        this.scene.start('DifficultyScene');
      } else {
        this.scene.start('GradeSelectScene');
      }
    });

    // ── Ubah profil ─────────────────────────────────────────────────
    if (save) {
      const gradeLabel = GRADE_CONFIG[save.grade]?.label ?? `Kelas ${save.grade}`;
      this.add.text(width / 2, height * 0.42, `👤 ${save.username}  •  ${gradeLabel}`, {
        fontSize: Math.floor(width * 0.028) + 'px',
        color: '#90CAF9',
      }).setOrigin(0.5);

      this.makeButton(width / 2, btnY + 80, '✏️  Ganti Profil', 0x37474F, 0x546E7A, () => {
        this.scene.start('GradeSelectScene');
      });

      // Leaderboard
      this.makeButton(width / 2, btnY + 160, '🏆  Leaderboard', 0x4A148C, 0x6A1B9A, () => {
        this.scene.start('LeaderboardScene');
      });
    }

    // ── Animasi judul bounce ────────────────────────────────────────
    const title = this.children.getAt(2) as Phaser.GameObjects.Text;
    this.tweens.add({
      targets: title,
      y: height * 0.22,
      duration: 1200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private makeButton(x: number, y: number, label: string, colorBase: number, colorHover: number, onClick: () => void): void {
    const { width } = this.scale;
    const btnW = Math.min(340, width * 0.6);
    const btnH = 60;

    const bg = this.add.rectangle(x, y, btnW, btnH, colorBase, 1)
      .setStrokeStyle(2, 0xFFFFFF, 0.3)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontSize: Math.floor(width * 0.03) + 'px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(colorHover));
    bg.on('pointerout',  () => bg.setFillStyle(colorBase));
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 0.96, scaleY: 0.96, duration: 80, yoyo: true });
      this.time.delayedCall(160, onClick);
    });
  }
}
