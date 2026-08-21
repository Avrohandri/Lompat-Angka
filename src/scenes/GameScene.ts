import Phaser from 'phaser';
import { DIFFICULTY_CONFIG, DIFFICULTY_THEME } from '../config/difficulty';
import { generateQuestion, type Question } from '../systems/QuestionGenerator';
import { ScoreSystem } from '../systems/ScoreSystem';
import { InputManager } from '../systems/InputManager';
import { SaveManager } from '../systems/SaveManager';

// ─── Konstanta layout ─────────────────────────────────────────────────────────
const GROUND_H = 80;
const GATE_HEIGHT = 160;
const GATE_WIDTH = 90;

interface GateGroup {
  gates: { bg: Phaser.GameObjects.Image; label: Phaser.GameObjects.Text; isCorrect: boolean }[];
  question: Question;
  triggered: boolean;
  promptText: Phaser.GameObjects.Text;
  gateWorldX: number;
}

export class GameScene extends Phaser.Scene {
  // ── config ──────────────────────────────────────────────────────────────────
  private grade = 3;
  private difficulty = 3;

  // ── physics / objects ────────────────────────────────────────────────────────
  private player!: Phaser.Physics.Arcade.Image;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private spikeGroup!: Phaser.Physics.Arcade.Group;
  private coinGroup!: Phaser.Physics.Arcade.Group;

  // ── systems ──────────────────────────────────────────────────────────────────
  private scoreSystem!: ScoreSystem;
  private inputMgr!: InputManager;

  // ── state ────────────────────────────────────────────────────────────────────
  private lives = 3;
  private isGrounded = false;
  private boostMode = false;
  private boostTimer = 0;
  private gateGroups: GateGroup[] = [];
  private nextQuestionX = 0;
  private spikeTimer = 0;
  private gracePeriod = 3000; // ms bebas spike di awal
  private gameOver = false;

  // ── world bounds ─────────────────────────────────────────────────────────────
  private readonly WORLD_WIDTH = 99999;

  // ── HUD refs (setScrollFactor(0)) ────────────────────────────────────────────
  private scoreTxt!: Phaser.GameObjects.Text;
  private comboTxt!: Phaser.GameObjects.Text;
  private livesTxt!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'GameScene' }); }

  init(data: { grade: number; difficulty: number; username: string }): void {
    this.grade      = data.grade ?? 3;
    this.difficulty = data.difficulty ?? 3;
  }

  create(): void {
    const cfg   = DIFFICULTY_CONFIG[this.difficulty];
    const theme = DIFFICULTY_THEME[this.difficulty];
    const { width, height } = this.scale;

    // reset state
    this.scoreSystem = new ScoreSystem();
    this.lives       = cfg.lives;
    this.boostMode   = false;
    this.gateGroups  = [];
    this.gameOver    = false;
    this.isGrounded  = false;
    this.spikeTimer  = 0;
    this.gracePeriod  = 3000;

    // ── Physics world ──────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, height * 2);

    // ── Background ─────────────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor(theme.bgColor);

    // Blocky Clouds Parallax
    for (let i = 0; i < 20; i++) {
      const cx = Phaser.Math.Between(0, this.WORLD_WIDTH);
      const cy = Phaser.Math.Between(0, height * 0.5);
      const size = Phaser.Math.Between(50, 150);
      this.add.rectangle(cx, cy, size, size * 0.6, 0xFFFFFF, 0.8)
        .setScrollFactor(Phaser.Math.FloatBetween(0.1, 0.4))
        .setDepth(0);
    }

    // ── Ground (tiling across world) ───────────────────────────────────────
    this.groundGroup = this.physics.add.staticGroup();
    const groundY = height - GROUND_H / 2;
    for (let x = 0; x < this.WORLD_WIDTH; x += 64) {
      this.groundGroup.create(x, groundY, 'ground').setScale(1, GROUND_H / 32).refreshBody();
    }

    // ── Player ─────────────────────────────────────────────────────────────
    const playerStartX = width * 0.15;
    const playerStartY = height - GROUND_H - 24;
    this.player = this.physics.add.image(playerStartX, playerStartY, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(600);
    this.player.setDepth(10);

    // ── Physics collisions ─────────────────────────────────────────────────
    this.physics.add.collider(this.player, this.groundGroup, () => {
      this.isGrounded = true;
    });

    this.spikeGroup = this.physics.add.group();
    this.coinGroup  = this.physics.add.group();

    this.physics.add.overlap(this.player, this.spikeGroup, (_pl, spk) => {
      const s = spk as Phaser.Physics.Arcade.Image;
      if (!s.getData('hit') && !this.gameOver) {
        s.setData('hit', true);
        this.onHit();
      }
    });

    this.physics.add.overlap(this.player, this.coinGroup, (_pl, cn) => {
      const c = cn as Phaser.Physics.Arcade.Image;
      if (!c.getData('collected') && !this.gameOver) {
        c.setData('collected', true);
        c.setVisible(false);
        this.scoreSystem.onCorrect(0.5);
        this.updateHUD();
        this.spawnCelebration(c.x, c.y, 0xFFD600, 4);
      }
    });

    // ── Camera follows player ──────────────────────────────────────────────
    this.cameras.main.startFollow(
      this.player,
      true,       // round pixels
      0.1,        // lerpX — smooth follow
      0,          // lerpY — don't follow Y
    );
    // Lock camera Y so it doesn't follow jumps
    this.cameras.main.setFollowOffset(-(width * 0.35), 0);

    // ── HUD (scrollFactor 0 = fixed to camera) ─────────────────────────────
    this.createHUD();

    // ── Input ──────────────────────────────────────────────────────────────
    this.inputMgr = new InputManager(this);
    this.inputMgr.on((intent) => {
      if (this.gameOver) return;
      if (intent === 'jump' && this.isGrounded) {
        this.player.setVelocityY(-700);
        this.isGrounded = false;
      }
      if (intent === 'laneUp' && this.isGrounded) {
        this.player.setVelocityY(-700);
        this.isGrounded = false;
      }
    });

    // ── First question ─────────────────────────────────────────────────────
    this.nextQuestionX = playerStartX + width * 1.5;
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────

  private createHUD(): void {
    const { width } = this.scale;
    const fs = Math.max(18, Math.floor(width * 0.03));
    const fontFam = '"Impact", "Arial Black", sans-serif';

    this.scoreTxt = this.add.text(16, 16, 'SKOR: 0', {
      fontFamily: fontFam,
      fontSize: `${fs}px`,
      color: GAME_CONSTANTS.COLOR_GOLD,
      stroke: '#000000',
      strokeThickness: 4,
    }).setScrollFactor(0).setDepth(50);

    this.comboTxt = this.add.text(16, 16 + fs + 8, 'COMBO: x1', {
      fontFamily: fontFam,
      fontSize: `${fs}px`,
      color: '#69F0AE',
      stroke: '#000000',
      strokeThickness: 4,
    }).setScrollFactor(0).setDepth(50);

    this.livesTxt = this.add.text(width - 16, 16, this.livesStr(), {
      fontFamily: fontFam,
      fontSize: `${fs}px`,
      color: '#FF5252',
      stroke: '#000000',
      strokeThickness: 4,
    }).setScrollFactor(0).setDepth(50).setOrigin(1, 0);

    // kontrol hint
    this.add.text(width / 2, this.scale.height - 24,
      '↑/W/SPACE = LOMPAT  |  TAP ATAS = LOMPAT', {
        fontFamily: fontFam,
        fontSize: `${Math.max(12, Math.floor(width * 0.02))}px`,
        color: GAME_CONSTANTS.COLOR_WHITE,
        stroke: '#000000',
        strokeThickness: 3,
      }).setScrollFactor(0).setDepth(50).setOrigin(0.5, 1);
  }

  private livesStr(): string {
    return '❤️ '.repeat(Math.max(0, this.lives)).trim() || '💀';
  }

  private updateHUD(): void {
    const state = this.scoreSystem.getState();
    this.scoreTxt.setText(`Skor: ${state.score}`);
    this.comboTxt.setText(`Combo: x${Math.min(state.combo, 5)}`);
    this.livesTxt.setText(this.livesStr());
  }

  // ─── Spawn obstacle ───────────────────────────────────────────────────────

  private spawnSpike(): void {
    const { height } = this.scale;
    const cfg = DIFFICULTY_CONFIG[this.difficulty];
    if (Math.random() > cfg.obstacleRate) return;

    const camRight = this.cameras.main.scrollX + this.scale.width;
    const spawnX = camRight + Phaser.Math.Between(100, 300);
    const spawnY = height - GROUND_H - 20;

    const spike = this.physics.add.image(spawnX, spawnY, 'spike') as Phaser.Physics.Arcade.Image;
    spike.setImmovable(true);
    (spike.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    spike.setData('hit', false);
    this.spikeGroup.add(spike);
  }

  // ─── Spawn question ───────────────────────────────────────────────────────

  private spawnQuestion(): void {
    const { width, height } = this.scale;
    const cfg = DIFFICULTY_CONFIG[this.difficulty];
    const question = generateQuestion(this.grade, this.difficulty);
    const gateCount = question.gates.length;

    // prompt text jauh di depan player
    const promptX = this.nextQuestionX;
    const promptY = height * 0.18;

    const promptTxt = this.add.text(promptX, promptY, `❓ ${question.prompt}`, {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: `${Math.floor(width * 0.042)}px`,
      color: GAME_CONSTANTS.COLOR_GOLD,
      stroke: '#000000',
      strokeThickness: 5,
      backgroundColor: '#00000099',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(20);

    // gerbang lebih jauh lagi (runway)
    const runwayPx = cfg.speed * (cfg.runwayMs / 1000);
    const gateWorldX = promptX + runwayPx;
    const gateSpacing = Math.max(GATE_WIDTH + 16, (width * 0.6) / Math.max(gateCount, 1));
    const totalGateWidth = (gateCount - 1) * gateSpacing;

    const gates: GateGroup['gates'] = [];
    question.gates.forEach((val, idx) => {
      const isCorrect = idx === question.correctIndex;
      const gx = gateWorldX - totalGateWidth / 2 + idx * gateSpacing;
      const gy = height - GROUND_H - GATE_HEIGHT / 2;

      const gateBg = this.add.image(gx, gy, 'gate_open').setDepth(8);
      const lbl = this.add.text(gx, gy - 15, String(val), {
        fontFamily: GAME_CONSTANTS.FONT_FAMILY,
        fontSize: `${Math.floor(GATE_WIDTH * 0.42)}px`,
        color: GAME_CONSTANTS.COLOR_WHITE,
        stroke: '#000',
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(9);

      gates.push({ bg: gateBg, label: lbl, isCorrect });
    });

    this.gateGroups.push({ gates, question, triggered: false, promptText: promptTxt, gateWorldX });

    // next question: setelah gate + runway + buffer
    this.nextQuestionX = gateWorldX + runwayPx + width;
  }

  // ─── Gate check ───────────────────────────────────────────────────────────

  private checkGates(): void {
    const px = this.player.x;
    const py = this.player.y;

    for (const group of this.gateGroups) {
      if (group.triggered) continue;
      // player harus sampai di X area gate
      if (px < group.gateWorldX - GATE_WIDTH) continue;
      if (px > group.gateWorldX + GATE_WIDTH * 2) {
        // melewatkan gate tanpa terpilih = wrong
        group.triggered = true;
        this.onWrongGate(group, null);
        continue;
      }

      // cari gate terdekat secara Y
      let closest = group.gates[0];
      let minDist = Infinity;
      for (const g of group.gates) {
        const d = Math.abs(g.bg.y - py);
        if (d < minDist) { minDist = d; closest = g; }
      }

      // threshold 100px Y
      if (minDist > 100) continue;

      group.triggered = true;
      if (closest.isCorrect) {
        this.onCorrectGate(group);
      } else {
        this.onWrongGate(group, closest);
      }
    }

    // cleanup triggered groups yang sudah jauh
    this.gateGroups = this.gateGroups.filter(g => !g.triggered);
  }

  private onCorrectGate(group: GateGroup): void {
    const gained = this.scoreSystem.onCorrect(0.8);
    this.updateHUD();

    // feedback
    const cam = this.cameras.main;
    const screenX = group.gateWorldX - cam.scrollX;
    const fxt = this.add.text(screenX, this.scale.height * 0.3, `+${gained} ✓`, {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: '36px', color: '#69F0AE',
      stroke: '#000', strokeThickness: 5,
    }).setScrollFactor(0).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: fxt, y: fxt.y - 70, alpha: 0, duration: 900, onComplete: () => fxt.destroy() });

    // boost
    this.boostMode  = true;
    this.boostTimer = 2200;

    // particles
    this.spawnCelebration(group.gateWorldX, this.scale.height * 0.5, 0x69F0AE, 12);

    // bonus coins
    for (let i = 0; i < 6; i++) {
      const cx = group.gateWorldX + i * 70;
      const cy = this.scale.height - GROUND_H - 50;
      const coin = this.physics.add.image(cx, cy, 'coin') as Phaser.Physics.Arcade.Image;
      (coin.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      coin.setData('collected', false);
      this.coinGroup.add(coin);
    }

    this.cleanupGate(group);
  }

  private onWrongGate(group: GateGroup, _wrongGate: GateGroup['gates'][0] | null): void {
    if (this.gameOver) return;

    // highlight jawaban benar
    const correctGate = group.gates[group.question.correctIndex];
    correctGate.bg.setTexture('gate_wrong');

    const cam = this.cameras.main;
    const screenX = group.gateWorldX - cam.scrollX;
    const answerTxt = `✅ Jawaban: ${group.question.gates[group.question.correctIndex]}`;
    const hint = this.add.text(screenX, this.scale.height * 0.25, answerTxt, {
      fontFamily: GAME_CONSTANTS.FONT_FAMILY,
      fontSize: '26px',
      color: GAME_CONSTANTS.COLOR_GOLD,
      backgroundColor: '#00000099',
      padding: { x: 10, y: 5 },
    }).setScrollFactor(0).setOrigin(0.5).setDepth(60);
    this.time.delayedCall(2200, () => hint.destroy());

    this.scoreSystem.onWrong();
    this.lives--;
    this.updateHUD();
    this.cameras.main.shake(250, 0.012);
    this.player.setTint(0xFF5252);
    this.time.delayedCall(400, () => { if (!this.gameOver) this.player.clearTint(); });

    if (this.lives <= 0) {
      this.time.delayedCall(700, () => this.endGame());
    }

    this.cleanupGate(group);
  }

  private cleanupGate(group: GateGroup): void {
    this.time.delayedCall(1200, () => {
      group.gates.forEach(g => { g.bg.destroy(); g.label.destroy(); });
      group.promptText.destroy();
    });
  }

  // ─── Particles ────────────────────────────────────────────────────────────

  private spawnCelebration(wx: number, wy: number, color: number, count: number): void {
    const cam = this.cameras.main;
    const sx = wx - cam.scrollX;
    const sy = wy;
    for (let i = 0; i < count; i++) {
      const dot = this.add.circle(sx, sy, 8, color).setScrollFactor(0).setDepth(55);
      const angle = (i / count) * Math.PI * 2;
      const spd = Phaser.Math.Between(80, 160);
      this.tweens.add({
        targets: dot,
        x: sx + Math.cos(angle) * spd,
        y: sy + Math.sin(angle) * spd,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 700,
        ease: 'Power2',
        onComplete: () => dot.destroy(),
      });
    }
  }

  // ─── Hit & game over ──────────────────────────────────────────────────────

  private onHit(): void {
    this.lives--;
    this.updateHUD();
    this.cameras.main.shake(200, 0.015);
    this.player.setTint(0xFF5252);
    this.time.delayedCall(400, () => { if (!this.gameOver) this.player.clearTint(); });
    if (this.lives <= 0) {
      this.time.delayedCall(500, () => this.endGame());
    }
  }

  private endGame(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.inputMgr.destroy();

    const state = this.scoreSystem.getState();
    const stars  = this.scoreSystem.calcStars();

    const save = SaveManager.load();
    if (save && state.score > (save.highScore ?? 0)) {
      SaveManager.update({ highScore: state.score, totalStars: (save.totalStars ?? 0) + stars });
    }

    this.scene.start('ResultScene', {
      score: state.score, stars,
      correct: state.correct, wrong: state.wrong,
      maxCombo: state.maxCombo,
      grade: this.grade, difficulty: this.difficulty,
    });
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    if (this.gameOver || !this.player) return;

    const cfg = DIFFICULTY_CONFIG[this.difficulty];
    const { height } = this.scale;

    this.inputMgr.update();

    // Move player forward (auto-run)
    const speed = this.boostMode ? cfg.speed * 1.6 : cfg.speed;
    this.player.setVelocityX(speed);

    // Boost timer
    if (this.boostMode) {
      this.boostTimer -= delta;
      if (this.boostTimer <= 0) this.boostMode = false;
    }

    // Grounded check
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.down) this.isGrounded = true;

    // Grace period (no spikes at start)
    if (this.gracePeriod > 0) {
      this.gracePeriod -= delta;
    } else {
      // Spawn spikes
      this.spikeTimer += delta;
      const spikeInterval = Math.max(600, 2000 - cfg.obstacleRate * 1000);
      if (this.spikeTimer > spikeInterval) {
        this.spikeTimer = 0;
        this.spawnSpike();
      }
    }

    // Spawn question
    if (this.player.x + this.scale.width >= this.nextQuestionX) {
      this.spawnQuestion();
    }

    // Gate check
    this.checkGates();

    // Cleanup far-left spikes & coins
    (this.spikeGroup.getChildren() as Phaser.Physics.Arcade.Image[]).forEach(s => {
      if (s.x < this.player.x - this.scale.width) s.destroy();
    });
    (this.coinGroup.getChildren() as Phaser.Physics.Arcade.Image[]).forEach(c => {
      if (c.x < this.player.x - this.scale.width) c.destroy();
    });

    // Player fall = death
    if (this.player.y > height + 50) {
      this.endGame();
    }
  }
}
