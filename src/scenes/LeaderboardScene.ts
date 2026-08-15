import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';

interface LeaderboardEntry {
  username: string;
  grade: number;
  difficulty: number;
  score: number;
  stars: number;
}

export class LeaderboardScene extends Phaser.Scene {
  private selectedGrade = 1;

  constructor() { super({ key: 'LeaderboardScene' }); }

  create(): void {
    const save = SaveManager.load();
    this.selectedGrade = save?.grade ?? 1;

    // Leaderboard di MVP disimpan di localStorage
    this.renderUI();
  }

  private getEntries(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem('lompat_angka_lb');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  static addEntry(entry: LeaderboardEntry): void {
    try {
      const raw = localStorage.getItem('lompat_angka_lb');
      const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
      entries.push(entry);
      entries.sort((a, b) => b.score - a.score);
      localStorage.setItem('lompat_angka_lb', JSON.stringify(entries.slice(0, 100)));
    } catch { /* ignore */ }
  }

  private renderUI(): void {
    const { width, height } = this.scale;
    this.children.removeAll(true);

    // BG
    const bg = this.add.rectangle(0, 0, width, height, 0x5C94FC).setOrigin(0);

    // Title
    this.add.text(width / 2, height * 0.08, 'LEADERBOARD', {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: Math.floor(width * 0.055) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Grade tabs
    const tabY = height * 0.18;
    for (let g = 1; g <= 6; g++) {
      const tabX = width * 0.1 + (g - 1) * (width * 0.135);
      const isSelected = g === this.selectedGrade;
      const tab = this.add.rectangle(tabX, tabY, width * 0.12, 36,
        isSelected ? 0x1565C0 : 0x37474F, 1)
        .setStrokeStyle(2, isSelected ? 0x42A5F5 : 0x546E7A, 1)
        .setInteractive({ useHandCursor: true });
      this.add.text(tabX, tabY, `KLS ${g}`, {
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontSize: Math.floor(width * 0.022) + 'px',
        color: isSelected ? '#FFD600' : '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      tab.on('pointerdown', () => {
        this.selectedGrade = g;
        this.renderUI();
      });
    }

    // Entries
    const entries = this.getEntries().filter(e => e.grade === this.selectedGrade);
    if (entries.length === 0) {
      this.add.text(width / 2, height * 0.55, 'BELUM ADA SKOR.\nMAIN DULU!', {
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontSize: Math.floor(width * 0.03) + 'px',
        color: '#FFFFFF',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5);
    } else {
      const colHeaders = ['#', 'Nama', 'Diff', 'Skor', '⭐'];
      const colX = [0.08, 0.25, 0.5, 0.68, 0.88].map(f => f * width);
      colHeaders.forEach((h, i) => {
        this.add.text(colX[i], height * 0.27, h.toUpperCase(), {
          fontFamily: '"Impact", "Arial Black", sans-serif',
          fontSize: Math.floor(width * 0.026) + 'px',
          color: '#FFD600',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5);
      });

      entries.slice(0, 8).forEach((e, idx) => {
        const rowY = height * 0.33 + idx * (height * 0.07);
        this.add.rectangle(width / 2, rowY, width * 0.9, height * 0.062,
          idx % 2 === 0 ? 0x1B2838 : 0x263238, 1);

        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : String(idx + 1);
        const vals = [medal, e.username.slice(0, 10), String(e.difficulty), String(e.score), '⭐'.repeat(e.stars)];
        vals.forEach((v, i) => {
          this.add.text(colX[i], rowY, v.toUpperCase(), {
            fontFamily: '"Impact", "Arial Black", sans-serif',
            fontSize: Math.floor(width * 0.025) + 'px',
            color: idx < 3 ? '#FFD600' : '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
          }).setOrigin(0.5);
        });
      });
    }

    // Back
    const backTxt = this.add.text(width / 2, height * 0.92, '⬅ KEMBALI KE MENU', {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: Math.floor(width * 0.025) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backTxt.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
