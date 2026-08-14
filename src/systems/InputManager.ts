// InputManager — abstraksi intent lintas platform

import Phaser from 'phaser';

export type Intent = 'jump' | 'laneUp' | 'laneDown';

type IntentHandler = (intent: Intent) => void;

export class InputManager {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<'W' | 'A' | 'S' | 'D' | 'SPACE', Phaser.Input.Keyboard.Key>;
  private handlers: IntentHandler[] = [];

  // track prev state untuk edge detection
  private prevUp = false;
  private prevDown = false;
  private prevJump = false;

  constructor(private scene: Phaser.Scene) {
    this.setupKeyboard();
    this.setupTouch();
  }

  private setupKeyboard(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    this.cursors = kb.createCursorKeys();
    this.wasd = {
      W:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
  }

  private setupTouch(): void {
    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const { width, height } = this.scene.scale;
      const relY = p.y / height;
      const relX = p.x / width;

      // Tap kiri bawah = jump, kanan bawah = jump juga
      // Tap atas layar = laneUp, bawah = laneDown
      if (relY < 0.4) {
        this.emit('laneUp');
      } else if (relY > 0.6) {
        this.emit('laneDown');
      } else {
        this.emit('jump');
      }
    });
  }

  update(): void {
    const up   = !!(this.cursors?.up.isDown    || this.wasd?.W.isDown);
    const down = !!(this.cursors?.down.isDown  || this.wasd?.S.isDown);
    const jump = !!(this.cursors?.space.isDown || this.wasd?.SPACE.isDown ||
                    this.cursors?.up.isDown    || this.wasd?.W.isDown);

    if (up   && !this.prevUp)   this.emit('laneUp');
    if (down && !this.prevDown) this.emit('laneDown');
    if (jump && !this.prevJump) this.emit('jump');

    this.prevUp   = up;
    this.prevDown = down;
    this.prevJump = jump;
  }

  on(handler: IntentHandler): void {
    this.handlers.push(handler);
  }

  off(handler: IntentHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  private emit(intent: Intent): void {
    this.handlers.forEach(h => h(intent));
  }

  destroy(): void {
    this.handlers = [];
    this.scene.input.off('pointerdown');
  }
}
