export interface WisdomDrop {
  day: number;
  category: string;
  quote: string;
  author: string;
  reflection: string;
  challenge: string;
}

export interface PrayerCompletion {
  date: string; // ISO date string YYYY-MM-DD
  duration: number; // minutes
  journalEntry?: string;
  wisdomDay: number;
}

export interface OracaoConjugalData {
  lastCompleted: string; // ISO date
  monthlyCount: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completions: PrayerCompletion[];
  currentWisdomIndex: number;
  lastMonthReset: string; // YYYY-MM to track month resets
}

export interface DeverSentarData {
  lastCompleted: string;
  scheduledDay: number; // day of month
  completions: Array<{
    date: string;
    notes?: string;
  }>;
}

export interface OracaoPessoalData {
  lastCompleted: string;
  monthlyCount: number;
  currentStreak: number;
  completions: string[]; // ISO dates
}

export interface RegraDeVidaData {
  lastCompleted: string;
  monthlyCompleted: boolean;
  notes?: string;
}

export interface RetiroAnualData {
  lastCompleted: string;
  yearCompleted: boolean;
  notes?: string;
}

export interface LiturgyData {
  data: string;
  liturgia: string;
  cor: string;
  dia: string;
  evangelho: string;
  evangelhoReferencia?: string;
  evangelhoTitulo?: string;
  primeiraLeitura?: string;
  salmo?: string;
  segundaLeitura?: string;
}

export type PCEType = 'oracao-pessoal' | 'oracao-conjugal' | 'dever-sentar' | 'regra-vida' | 'retiro-anual';

export interface PCECard {
  id: PCEType;
  title: string;
  subtitle: string;
  emoji: string;
  frequency: string;
  color: string;
}
