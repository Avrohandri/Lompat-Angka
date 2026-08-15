// DifficultyConfig — semua angka tuning ada di sini, tidak hard-code di game logic

export interface DifficultyParams {
  speed: number;          // pixel/detik
  runwayMs: number;       // ms antara soal muncul → percabangan (waktu berpikir)
  lives: number;
  gateCount: number;      // jumlah jalur / opsi jawaban
  closeness: number;      // 1=pengecoh jauh, 5=sangat dekat
  numberRange: [number, number]; // [min, max] untuk operand
  steps: number;          // jumlah langkah operasi
  obstacleRate: number;   // 0–1, makin tinggi makin rapat
}

export const DIFFICULTY_CONFIG: Record<number, DifficultyParams> = {
  1: { speed: 220, runwayMs: 3500, lives: 5, gateCount: 2, closeness: 1, numberRange: [1, 10],  steps: 1, obstacleRate: 0.2 },
  2: { speed: 290, runwayMs: 2800, lives: 4, gateCount: 2, closeness: 2, numberRange: [1, 20],  steps: 1, obstacleRate: 0.35 },
  3: { speed: 360, runwayMs: 2200, lives: 3, gateCount: 3, closeness: 3, numberRange: [1, 50],  steps: 1, obstacleRate: 0.5 },
  4: { speed: 430, runwayMs: 1600, lives: 2, gateCount: 3, closeness: 4, numberRange: [5, 100], steps: 2, obstacleRate: 0.7 },
  5: { speed: 520, runwayMs: 1000, lives: 1, gateCount: 4, closeness: 5, numberRange: [5, 100], steps: 2, obstacleRate: 0.9 },
};

// Theme visual per difficulty (flat design style)
export const DIFFICULTY_THEME: Record<number, { label: string; bgColor: string; groundColor: number; accentColor: number }> = {
  1: { label: 'Taman Cerah',    bgColor: '#5C94FC', groundColor: 0x5D4037, accentColor: 0xFFEB3B },
  2: { label: 'Hutan',          bgColor: '#5C94FC', groundColor: 0x5D4037, accentColor: 0x8BC34A },
  3: { label: 'Gua Kristal',    bgColor: '#5C94FC', groundColor: 0x5D4037, accentColor: 0xCE93D8 },
  4: { label: 'Senja Gunung',   bgColor: '#5C94FC', groundColor: 0x5D4037, accentColor: 0xFFD54F },
  5: { label: 'Luar Angkasa',   bgColor: '#5C94FC', groundColor: 0x5D4037, accentColor: 0x00FFFF },
};
