import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload(): void {
    // generate aset programatik sederhana untuk MVP — tidak perlu file eksternal
    this.generateAssets();
  }

  private generateAssets(): void {
    const gfx = this.make.graphics({ x: 0, y: 0 });

    // ── Player (Slime hijau kotak) ───────────────────────────────────
    gfx.clear();
    gfx.fillStyle(0x8CC63F, 1); // Hijau terang
    gfx.fillRect(0, 0, 48, 48); // Kotak penuh
    gfx.fillStyle(0x000000, 1); // Mata hitam
    gfx.fillRect(10, 16, 8, 8);
    gfx.fillRect(30, 16, 8, 8);
    gfx.fillRect(20, 30, 8, 4); // Mulut kecil (opsional)
    gfx.generateTexture('player', 48, 48);

    // ── Ground tile (Coklat dengan atas hijau) ──────────────────────
    gfx.clear();
    gfx.fillStyle(0x5D4037, 1); // Coklat tanah
    gfx.fillRect(0, 0, 64, 32);
    gfx.fillStyle(0x8CC63F, 1); // Hijau rumput
    gfx.fillRect(0, 0, 64, 8);
    gfx.generateTexture('ground', 64, 32);

    // ── Obstacle (Balok hitam simpel) ──────────────────────────────
    gfx.clear();
    gfx.fillStyle(0x212121, 1); // Hitam gelap
    gfx.fillRect(0, 0, 40, 40); // Ukuran kotak
    gfx.fillStyle(0x424242, 1); // Aksen garis abu
    gfx.fillRect(10, 10, 20, 4);
    gfx.fillRect(5, 25, 30, 4);
    gfx.generateTexture('spike', 40, 40);

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
