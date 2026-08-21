import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { GRADE_CONFIG } from '../config/grades';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveManager.load();

    // ── Background (Sky Blue Flat) ─────────────────────────────────────────
    this.cameras.main.setBackgroundColor('#5C94FC');

    // ── Simple Blocky Clouds ─────────────────────────────────────────
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height * 0.4);
      const size = Phaser.Math.Between(40, 100);
      this.add.rectangle(x, y, size, size * 0.6, 0xFFFFFF, 0.8).setDepth(0);
    }

    // Menghapus efek bintang parallax karena tema sekarang siang hari

    // ── Floating Math Symbols ─────────────────────────────────────────
    const symbols = ['+', '-', '×', '÷', '1', '2', '3', '7', '?', '='];
    for (let i = 0; i < 15; i++) {
      const sym = Phaser.Utils.Array.GetRandom(symbols);
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(16, 40);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.4);

      const text = this.add.text(x, y, sym, {
        fontSize: `${size}px`,
        color: '#FFFFFF',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(alpha).setDepth(0);

      this.tweens.add({
        targets: text,
        y: y - Phaser.Math.Between(50, 150),
        x: x + Phaser.Math.Between(-30, 30),
        angle: Phaser.Math.Between(-180, 180),
        alpha: { start: alpha, to: 0 },
        duration: Phaser.Math.Between(4000, 8000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
      });
    }

    // ── Title ───────────────────────────────────────────────────────
    this.add.text(width / 2, height * 0.2, 'LOMPAT ANGKA', {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: Math.floor(width * 0.08) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: { blur: 0, color: '#000000', offsetX: 4, offsetY: 4, fill: true },
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.3, 'LARI • HITUNG • MENANG', {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: Math.floor(width * 0.035) + 'px',
      color: '#FFD600',
      stroke: '#000000',
      strokeThickness: 4,
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
      this.add.text(width / 2, height * 0.42, `👤 ${save.username.toUpperCase()} • ${gradeLabel.toUpperCase()}`, {
        fontFamily: GAME_CONSTANTS.FONT_FAMILY,
        fontSize: Math.floor(width * 0.028) + 'px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
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

    const txt = this.add.text(x, y, label.toUpperCase(), {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: Math.floor(width * 0.03) + 'px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(colorHover));
    bg.on('pointerout',  () => bg.setFillStyle(colorBase));
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 0.96, scaleY: 0.96, duration: 80, yoyo: true });
      this.time.delayedCall(160, onClick);
    });
  }
}
