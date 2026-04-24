export type UnitClass = 'infantry' | 'archer' | 'cavalry' | 'knight' | 'engineer';
export type BuildingType = 'tower' | 'wall' | 'catapult';
export type ResourceType = 'mine' | 'farm';
export type CapturePointType = 'castle' | 'mine' | 'farm' | 'tower';
export type PlayerRank = 'Новобранец' | 'Ратник' | 'Сержант' | 'Рыцарь' | 'Барон' | 'Полководец';

export interface Vec2 { x: number; y: number; }

export interface UnitDef {
  class: UnitClass;
  label: string;
  emoji: string;
  hp: number;
  atk: number;
  spd: number;
  range: number;
  goldCost: number;
  foodCost: number;
  color: string;
}

export interface Unit {
  id: string;
  class: UnitClass;
  ownerId: string;
  pos: Vec2;
  targetPos: Vec2 | null;
  hp: number;
  maxHp: number;
  atk: number;
  spd: number;
  range: number;
  attackCooldown: number;
  state: 'idle' | 'moving' | 'attacking' | 'dead';
  targetUnitId: string | null;
  color: string;
  emoji: string;
  label: string;
  level: number;
}

export interface Commander {
  id: string;
  ownerId: string;
  pos: Vec2;
  hp: number;
  maxHp: number;
  alive: boolean;
}

export interface CapturePoint {
  id: string;
  pos: Vec2;
  type: CapturePointType;
  radius: number;
  ownerId: string | null;
  captureProgress: number; // 0..100, owner's side
  capturingPlayerId: string | null;
  label: string;
  emoji: string;
  goldPerSec: number;
  foodPerSec: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  ownerId: string;
  pos: Vec2;
  hp: number;
  maxHp: number;
  emoji: string;
  atk: number;
  range: number;
  attackCooldown: number;
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  color: string;
  gold: number;
  food: number;
  score: number;
  kills: number;
  deaths: number;
  rank: PlayerRank;
  unitIds: string[];
  commanderId: string;
  alive: boolean;
  botStrategy?: BotStrategy;
  recruitCooldown: number;
}

export type BotStrategy = 'aggressive' | 'defensive' | 'economic';

export interface DailyQuest {
  id: string;
  label: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

export interface GameState {
  phase: 'lobby' | 'playing' | 'ended';
  tick: number;
  players: Record<string, Player>;
  units: Record<string, Unit>;
  commanders: Record<string, Commander>;
  capturePoints: Record<string, CapturePoint>;
  buildings: Record<string, Building>;
  humanPlayerId: string;
  winner: string | null;
  log: string[];
  quests: DailyQuest[];
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  rank: PlayerRank;
  kd: string;
}

export const UNIT_DEFS: Record<UnitClass, UnitDef> = {
  infantry: { class: 'infantry', label: 'Пехота',    emoji: '⚔️', hp: 120, atk: 18, spd: 60,  range: 32,  goldCost: 40,  foodCost: 1, color: '#6ab0d4' },
  archer:   { class: 'archer',   label: 'Лучник',    emoji: '🏹', hp: 80,  atk: 22, spd: 55,  range: 100, goldCost: 60,  foodCost: 1, color: '#7eb87e' },
  cavalry:  { class: 'cavalry',  label: 'Всадник',   emoji: '🐴', hp: 150, atk: 28, spd: 100, range: 36,  goldCost: 100, foodCost: 2, color: '#c9a84c' },
  knight:   { class: 'knight',   label: 'Рыцарь',    emoji: '🛡️', hp: 220, atk: 24, spd: 45,  range: 30,  goldCost: 150, foodCost: 2, color: '#c47ac4' },
  engineer: { class: 'engineer', label: 'Инженер',   emoji: '🔨', hp: 70,  atk: 10, spd: 50,  range: 28,  goldCost: 80,  foodCost: 1, color: '#e8734a' },
};

// Система: cavalry > archer > infantry > cavalry; knight — универсал; engineer — строитель
export const COUNTER_BONUS: Partial<Record<UnitClass, UnitClass[]>> = {
  cavalry:  ['archer'],
  archer:   ['infantry'],
  infantry: ['cavalry'],
};

export const RANKS: PlayerRank[] = ['Новобранец', 'Ратник', 'Сержант', 'Рыцарь', 'Барон', 'Полководец'];
export const RANK_COLORS: Record<PlayerRank, string> = {
  'Новобранец': '#8b9aad',
  'Ратник':     '#7eb87e',
  'Сержант':    '#6ab0d4',
  'Рыцарь':     '#c9a84c',
  'Барон':      '#c47ac4',
  'Полководец': '#e8734a',
};
export const RANK_THRESHOLDS: Record<PlayerRank, number> = {
  'Новобранец': 0,
  'Ратник':     200,
  'Сержант':    500,
  'Рыцарь':     1000,
  'Барон':      2000,
  'Полководец': 4000,
};
