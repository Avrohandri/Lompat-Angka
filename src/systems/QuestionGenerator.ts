// QuestionGenerator — jantung edukatif, murni tanpa Phaser, bisa di-unit-test sendiri

import { DIFFICULTY_CONFIG, type DifficultyParams } from '../config/difficulty';
import { GRADE_CONFIG, type Topic } from '../config/grades';

export interface Question {
  prompt: string;       // mis. "7 + 5 = ?"
  gates: number[];      // semua opsi, sudah diacak
  correctIndex: number; // indeks jawaban benar di gates[]
  runwayMs: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Distraktor mendidik ─────────────────────────────────────────────────────

function generateDistractors(correct: number, _topic: Topic, count: number, closeness: number): number[] {
  const distractors = new Set<number>();
  const spread = Math.max(1, Math.ceil(closeness * 1.5)); // makin tinggi closeness, makin dekat

  const strategies: Array<() => number> = [
    () => correct + randInt(1, spread),          // off-by-n (too high)
    () => correct - randInt(1, spread),          // off-by-n (too low)
    () => correct + 10,                          // off-by-ten
    () => correct - 10,                          // off-by-ten
    () => correct + randInt(spread + 1, spread * 3), // agak jauh
    () => Math.max(0, correct - randInt(spread + 1, spread * 3)),
    () => {                                       // digit terbalik
      const s = String(correct).split('').reverse().join('');
      const v = parseInt(s, 10);
      return isNaN(v) ? correct + 1 : v;
    },
  ];

  let tries = 0;
  while (distractors.size < count && tries < 100) {
    const val = pickRandom(strategies)();
    if (val !== correct && val >= 0 && !distractors.has(val)) {
      distractors.add(val);
    }
    tries++;
  }

  // fallback jika masih kurang
  let fallback = correct + distractors.size + 1;
  while (distractors.size < count) {
    if (!distractors.has(fallback) && fallback !== correct) distractors.add(fallback);
    fallback++;
  }

  return Array.from(distractors).slice(0, count);
}

// ─── Generator per topik ─────────────────────────────────────────────────────

function makeAddition(params: DifficultyParams): { prompt: string; correct: number } {
  const [min, max] = params.numberRange;
  const a = randInt(min, max);
  const b = randInt(min, max);
  return { prompt: `${a} + ${b} = ?`, correct: a + b };
}

function makeSubtraction(params: DifficultyParams): { prompt: string; correct: number } {
  const [min, max] = params.numberRange;
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (a < b) [a, b] = [b, a]; // hasil selalu ≥ 0
  return { prompt: `${a} - ${b} = ?`, correct: a - b };
}

function makeMultiplication(params: DifficultyParams): { prompt: string; correct: number } {
  // batasi agar tidak terlalu besar
  const maxFactor = Math.min(12, Math.floor(params.numberRange[1] / 2));
  const a = randInt(2, maxFactor);
  const b = randInt(2, maxFactor);
  return { prompt: `${a} × ${b} = ?`, correct: a * b };
}

function makeDivision(params: DifficultyParams): { prompt: string; correct: number } {
  const maxFactor = Math.min(12, Math.floor(params.numberRange[1] / 2));
  const b = randInt(2, maxFactor);
  const correct = randInt(2, maxFactor);
  const a = b * correct; // pastikan hasil bulat
  return { prompt: `${a} ÷ ${b} = ?`, correct };
}

function makeMixed(params: DifficultyParams): { prompt: string; correct: number } {
  // 2 langkah: (a op b) op c
  const ops = ['+', '-', '×', '÷'];
  const op1 = pickRandom(ops.slice(0, 2)); // +/-
  const op2 = pickRandom(ops.slice(0, 2));

  const a = randInt(params.numberRange[0], Math.min(20, params.numberRange[1]));
  const b = randInt(params.numberRange[0], Math.min(20, params.numberRange[1]));
  const c = randInt(params.numberRange[0], Math.min(10, params.numberRange[1]));

  let mid: number;
  if (op1 === '+') mid = a + b;
  else { mid = Math.abs(a - b); }

  let correct: number;
  if (op2 === '+') correct = mid + c;
  else correct = Math.max(0, mid - c);

  const promptA = op1 === '+' ? `${a} + ${b}` : `${Math.max(a,b)} - ${Math.min(a,b)}`;
  const opSym2 = op2 === '+' ? '+' : '-';
  return { prompt: `(${promptA}) ${opSym2} ${c} = ?`, correct };
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export function generateQuestion(grade: number, difficulty: number): Question {
  const params = DIFFICULTY_CONFIG[difficulty];
  const gradeConf = GRADE_CONFIG[grade];
  const topic = pickRandom(gradeConf.topics);

  let raw: { prompt: string; correct: number };

  switch (topic) {
    case 'addition':       raw = makeAddition(params); break;
    case 'subtraction':    raw = makeSubtraction(params); break;
    case 'multiplication': raw = makeMultiplication(params); break;
    case 'division':       raw = makeDivision(params); break;
    case 'mixed':          raw = makeMixed(params); break;
    default:               raw = makeAddition(params);
  }

  const distractorCount = params.gateCount - 1;
  const distractors = generateDistractors(raw.correct, topic, distractorCount, params.closeness);
  const allOptions = shuffle([raw.correct, ...distractors]);
  const correctIndex = allOptions.indexOf(raw.correct);

  return {
    prompt: raw.prompt,
    gates: allOptions,
    correctIndex,
    runwayMs: params.runwayMs,
  };
}
