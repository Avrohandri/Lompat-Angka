import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MenuScene } from '../scenes/MenuScene';
import { GradeSelectScene } from '../scenes/GradeSelectScene';
import { DifficultyScene } from '../scenes/DifficultyScene';
import { GameScene } from '../scenes/GameScene';
import { ResultScene } from '../scenes/ResultScene';
import { LeaderboardScene } from '../scenes/LeaderboardScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0D1B2A',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'app',
  },
  scene: [
    BootScene,
    MenuScene,
    GradeSelectScene,
    DifficultyScene,
    GameScene,
    ResultScene,
    LeaderboardScene,
  ],
};
