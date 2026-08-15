import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { GRADE_CONFIG } from '../config/grades';

export class GradeSelectScene extends Phaser.Scene {
  private selectedGrade = 3;
  private usernameInput?: HTMLInputElement;

  constructor() { super({ key: 'GradeSelectScene' }); }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveManager.load();

    // background
    const bg = this.add.rectangle(0, 0, width, height, 0x5C94FC).setOrigin(0);

    this.add.text(width / 2, height * 0.1, 'PILIH KELAS & NAMA', {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: Math.floor(width * 0.055) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // ── Grade cards ──────────────────────────────────────────────────
    const grades = [1, 2, 3, 4, 5, 6];
    const cardW = Math.min(100, (width - 80) / 6);
    const cardH = cardW * 1.3;
    const startX = width / 2 - (cardW * 3 + 20 * 2.5);

    grades.forEach((g, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = startX + col * (cardW + 20) + cardW / 2;
      const cy = height * 0.32 + row * (cardH + 16);

      const card = this.add.rectangle(cx, cy, cardW, cardH, 0x1565C0, 1)
        .setStrokeStyle(3, g === this.selectedGrade ? 0xFFD600 : 0x42A5F5, 1)
        .setInteractive({ useHandCursor: true })
        .setData('grade', g);

      this.add.text(cx, cy - 10, `${g}`, {
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontSize: Math.floor(cardW * 0.45) + 'px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5).setData('grade', g);

      this.add.text(cx, cy + cardH * 0.28, GRADE_CONFIG[g].label.toUpperCase(), {
        fontFamily: '"Impact", "Arial Black", sans-serif',
        fontSize: Math.floor(cardW * 0.17) + 'px',
        color: '#FFD600',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);

      card.on('pointerdown', () => {
        this.selectedGrade = g;
        // update stroke semua card
        this.children.list.forEach(obj => {
          if (obj instanceof Phaser.GameObjects.Rectangle && obj.getData('grade')) {
            const isSelected = obj.getData('grade') === g;
            obj.setStrokeStyle(3, isSelected ? 0xFFD600 : 0x42A5F5, 1);
          }
        });
      });
    });

    // ── Username input (DOM) ────────────────────────────────────────
    this.add.text(width / 2, height * 0.68, 'NAMA PEMAIN:', {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: Math.floor(width * 0.03) + 'px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.usernameInput = document.createElement('input');
    const inp = this.usernameInput;
    inp.type = 'text';
    inp.placeholder = 'Ketik namamu...';
    inp.maxLength = 16;
    inp.value = save?.username ?? '';
    inp.style.cssText = `
      position:absolute;
      left:50%;
      transform:translateX(-50%);
      top:${Math.round(height * 0.72)}px;
      width:${Math.min(280, width * 0.5)}px;
      padding:10px 16px;
      border-radius:10px;
      border:4px solid #000000;
      background:#FFFFFF;
      color:#000000;
      font-family:"Impact", "Arial Black", sans-serif;
      font-size:24px;
      text-transform:uppercase;
      text-align:center;
      outline:none;
    `;
    document.body.appendChild(inp);

    // ── Tombol Lanjut ────────────────────────────────────────────────
    const btnX = width / 2;
    const btnY = height * 0.88;
    const btnW = Math.min(280, width * 0.5);
    const btnH = 56;

    const btnBg = this.add.rectangle(btnX, btnY, btnW, btnH, 0x2E7D32, 1)
      .setStrokeStyle(2, 0x66BB6A, 1)
      .setInteractive({ useHandCursor: true });
    this.add.text(btnX, btnY, 'LANJUT ▶', {
      fontFamily: '"Impact", "Arial Black", sans-serif',
      fontSize: Math.floor(width * 0.03) + 'px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      const name = inp.value.trim();
      if (!name) { inp.style.borderColor = '#E53935'; return; }
      SaveManager.save({
        username: name,
        grade: this.selectedGrade,
        highScore: save?.highScore ?? 0,
        totalStars: save?.totalStars ?? 0,
      });
      this.cleanup();
      this.scene.start('DifficultyScene');
    });
  }

  private cleanup(): void {
    if (this.usernameInput && document.body.contains(this.usernameInput)) {
      document.body.removeChild(this.usernameInput);
    }
  }

  shutdown(): void { this.cleanup(); }
}
