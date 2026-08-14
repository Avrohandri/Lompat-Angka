// SaveManager — localStorage wrapper

export interface SaveData {
  username: string;
  grade: number;
  highScore: number;
  totalStars: number;
}

const KEY = 'lompat_angka_save';

export const SaveManager = {
  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as SaveData) : null;
    } catch {
      return null;
    }
  },

  save(data: SaveData): void {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  update(patch: Partial<SaveData>): void {
    const current = SaveManager.load() ?? { username: '', grade: 3, highScore: 0, totalStars: 0 };
    SaveManager.save({ ...current, ...patch });
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
