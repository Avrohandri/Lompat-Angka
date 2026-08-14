import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload(): void {
    // generate aset programatik sederhana untuk MVP — tidak perlu file eksternal
    this.generateAssets();
  }

  private generateAssets(): void {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    // ── Player (kotak biru) ──────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0x4FC3F7, 1);
    gfx.fillRoundedRect(0, 0, 48, 48, 8);
    gfx.fillStyle(0xFFFFFF, 0.9);
    gfx.fillCircle(14, 16, 7);
    gfx.fillCircle(34, 16, 7);
    gfx.fillStyle(0x0D47A1, 1);
    gfx.fillCircle(14, 16, 4);
    gfx.fillCircle(34, 16, 4);
    gfx.generateTexture('player', 48, 48);

    // ── Ground tile ─────────────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0x558B2F, 1);
    gfx.fillRect(0, 0, 64, 32);
    gfx.fillStyle(0x33691E, 1);
    gfx.fillRect(0, 0, 64, 8);
    gfx.generateTexture('ground', 64, 32);

    // ── Obstacle (duri merah) ────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0xE53935, 1);
    gfx.fillTriangle(16, 0, 0, 40, 32, 40);
    gfx.generateTexture('spike', 32, 40);

    // ── Gate terbuka (hijau) ─────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0x43A047, 0.85);
    gfx.fillRoundedRect(0, 0, 90, 160, 12);
    gfx.lineStyle(4, 0x66BB6A, 1);
    gfx.strokeRoundedRect(2, 2, 86, 156, 12);
    gfx.generateTexture('gate_open', 90, 160);

    // ── Gate salah (merah) ───────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0xE53935, 0.85);
    gfx.fillRoundedRect(0, 0, 90, 160, 12);
    gfx.lineStyle(4, 0xEF9A9A, 1);
    gfx.strokeRoundedRect(2, 2, 86, 156, 12);
    gfx.generateTexture('gate_wrong', 90, 160);

    // ── Koin ─────────────────────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0xFFD600, 1);
    gfx.fillCircle(16, 16, 16);
    gfx.fillStyle(0xFFA000, 1);
    gfx.fillCircle(16, 16, 10);
    gfx.generateTexture('coin', 32, 32);

    // ── Heart (nyawa) ────────────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0xF44336, 1);
    gfx.fillCircle(10, 8, 10);
    gfx.fillCircle(22, 8, 10);
    gfx.fillTriangle(0, 12, 16, 32, 32, 12);
    gfx.generateTexture('heart', 32, 32);

    // ── Particle dot ────────────────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0xFFFFFF, 1);
    gfx.fillCircle(8, 8, 8);
    gfx.generateTexture('particle', 16, 16);

    // ── Platform (untuk mid-air) ─────────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0x795548, 1);
    gfx.fillRect(0, 0, 128, 24);
    gfx.fillStyle(0x5D4037, 1);
    gfx.fillRect(0, 0, 128, 6);
    gfx.generateTexture('platform', 128, 24);

    gfx.destroy();
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
