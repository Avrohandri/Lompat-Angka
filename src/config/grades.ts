// Grade config — domain materi per kelas

export type Topic =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'mixed';

export interface GradeConfig {
  label: string;
  topics: Topic[];
  description: string;
}

export const GRADE_CONFIG: Record<number, GradeConfig> = {
  1: {
    label: 'Kelas 1',
    topics: ['addition', 'subtraction'],
    description: 'Penjumlahan & pengurangan 1–20',
  },
  2: {
    label: 'Kelas 2',
    topics: ['addition', 'subtraction', 'multiplication'],
    description: 'Operasi sampai 100, perkalian 2, 5, 10',
  },
  3: {
    label: 'Kelas 3',
    topics: ['multiplication', 'division', 'mixed'],
    description: 'Perkalian & pembagian, operasi campuran',
  },
  4: {
    label: 'Kelas 4',
    topics: ['multiplication', 'division', 'mixed'],
    description: 'Operasi campuran, KPK/FPB dasar',
  },
  5: {
    label: 'Kelas 5',
    topics: ['mixed'],
    description: 'Operasi kompleks, desimal, pecahan',
  },
  6: {
    label: 'Kelas 6',
    topics: ['mixed'],
    description: 'Persen, perbandingan, bilangan negatif',
  },
};
