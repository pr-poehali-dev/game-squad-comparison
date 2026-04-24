import { GameState, UNIT_DEFS, UnitClass, RANK_COLORS, DailyQuest } from './types';
import Icon from '@/components/ui/icon';

interface ResourceBarProps { state: GameState; }
export function ResourceBar({ state }: ResourceBarProps) {
  const p = state.players[state.humanPlayerId];
  if (!p) return null;
  const rankColor = RANK_COLORS[p.rank];

  return (
    <div className="flex items-center gap-3 px-4 py-2 flex-wrap"
      style={{ background: 'linear-gradient(90deg, hsl(222 20% 8%), hsl(222 22% 6%))', borderBottom: '1px solid #c9a84c33' }}>
      {/* Золото */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: '#c9a84c22', border: '1px solid #c9a84c44' }}>
        <span>💰</span>
        <span className="font-mono text-sm font-bold" style={{ color: '#f0c060' }}>{Math.floor(p.gold)}</span>
      </div>
      {/* Еда */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: '#7eb87e22', border: '1px solid #7eb87e44' }}>
        <span>🌾</span>
        <span className="font-mono text-sm font-bold" style={{ color: '#7eb87e' }}>{Math.floor(p.food)}</span>
      </div>
      {/* Юниты */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: '#6ab0d422', border: '1px solid #6ab0d444' }}>
        <Icon name="Users" size={14} style={{ color: '#6ab0d4' }} />
        <span className="font-mono text-sm font-bold" style={{ color: '#6ab0d4' }}>{p.unitIds.length}/5</span>
      </div>
      {/* Очки */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: '#ffffff11', border: '1px solid #ffffff22' }}>
        <Icon name="Star" size={14} style={{ color: '#fff' }} />
        <span className="font-mono text-sm font-bold text-white">{p.score}</span>
      </div>
      {/* Ранг */}
      <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-lg"
        style={{ background: rankColor + '22', border: `1px solid ${rankColor}55` }}>
        <span className="text-xs font-bold" style={{ color: rankColor, fontFamily: 'Manrope, sans-serif' }}>{p.rank}</span>
      </div>
    </div>
  );
}

interface RecruitPanelProps {
  state: GameState;
  onRecruit: (cls: UnitClass) => void;
  onBuildTower: () => void;
}
export function RecruitPanel({ state, onRecruit, onBuildTower }: RecruitPanelProps) {
  const p = state.players[state.humanPlayerId];
  if (!p) return null;
  const hasEngineer = p.unitIds.some(id => state.units[id]?.class === 'engineer');

  return (
    <div className="p-3 space-y-2" style={{ background: 'hsl(222 18% 7%)', borderTop: '1px solid #c9a84c22' }}>
      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c99', fontFamily: 'Manrope, sans-serif' }}>Нанять войска</div>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(UNIT_DEFS) as [UnitClass, typeof UNIT_DEFS[UnitClass]][]).map(([cls, def]) => {
          const canAfford = p.gold >= def.goldCost && p.food >= def.foodCost;
          const full = p.unitIds.length >= 5;
          const disabled = !canAfford || full;
          return (
            <button key={cls} onClick={() => onRecruit(cls)} disabled={disabled}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-xs"
              style={{
                background: disabled ? '#ffffff08' : def.color + '22',
                border: `1px solid ${disabled ? '#ffffff15' : def.color + '66'}`,
                color: disabled ? '#555' : def.color,
                fontFamily: 'Manrope, sans-serif',
                cursor: disabled ? 'not-allowed' : 'pointer',
                minWidth: 64,
              }}
              title={`${def.label} — 💰${def.goldCost} 🌾${def.foodCost}`}
            >
              <span className="text-lg">{def.emoji}</span>
              <span className="font-semibold">{def.label}</span>
              <span className="opacity-70">💰{def.goldCost} 🌾{def.foodCost}</span>
            </button>
          );
        })}
        {/* Башня */}
        <button onClick={onBuildTower} disabled={!hasEngineer || p.gold < 200}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-xs"
          style={{
            background: hasEngineer && p.gold >= 200 ? '#e8734a22' : '#ffffff08',
            border: `1px solid ${hasEngineer && p.gold >= 200 ? '#e8734a66' : '#ffffff15'}`,
            color: hasEngineer && p.gold >= 200 ? '#e8734a' : '#555',
            fontFamily: 'Manrope, sans-serif',
            cursor: !hasEngineer || p.gold < 200 ? 'not-allowed' : 'pointer',
            minWidth: 64,
          }}
          title="Построить башню (нужен инженер, 💰200)"
        >
          <span className="text-lg">🗼</span>
          <span className="font-semibold">Башня</span>
          <span className="opacity-70">💰200</span>
        </button>
      </div>
      <div className="text-[10px] mt-1" style={{ color: '#555', fontFamily: 'Manrope, sans-serif' }}>
        ЛКМ — приказ двигаться · ПКМ+тянуть — камера · Колёсико — зум
      </div>
    </div>
  );
}

interface LeaderboardPanelProps { state: GameState; }
export function LeaderboardPanel({ state }: LeaderboardPanelProps) {
  const entries = state.leaderboard.slice(0, 8);
  return (
    <div className="p-3 space-y-1">
      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c99' }}>Лидеры</div>
      {entries.map((e, i) => {
        const color = RANK_COLORS[e.rank];
        const isHuman = state.players[state.humanPlayerId]?.name === e.name;
        return (
          <div key={i} className="flex items-center gap-2 px-2 py-1 rounded"
            style={{ background: isHuman ? '#f0c06015' : 'transparent', border: isHuman ? '1px solid #f0c06030' : '1px solid transparent' }}>
            <span className="text-xs font-mono w-4" style={{ color: i === 0 ? '#f0c060' : '#555' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
            </span>
            <span className="flex-1 text-xs truncate" style={{ color: isHuman ? '#f0c060' : '#ccc', fontFamily: 'Manrope, sans-serif' }}>
              {e.name}
            </span>
            <span className="text-[10px] font-mono" style={{ color }}>{e.score}</span>
          </div>
        );
      })}
    </div>
  );
}

interface QuestPanelProps { quests: DailyQuest[]; }
export function QuestPanel({ quests }: QuestPanelProps) {
  return (
    <div className="p-3 space-y-2">
      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c99' }}>Задания дня</div>
      {quests.map(q => (
        <div key={q.id} className="rounded-lg p-2"
          style={{ background: q.completed ? '#4caf5015' : '#ffffff08', border: `1px solid ${q.completed ? '#4caf5040' : '#ffffff10'}` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px]" style={{ color: q.completed ? '#4caf50' : '#ccc', fontFamily: 'Manrope, sans-serif' }}>
              {q.completed ? '✅ ' : ''}{q.label}
            </span>
            <span className="text-[10px] font-mono" style={{ color: '#c9a84c' }}>+{q.reward}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ffffff15' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (q.progress / q.target) * 100)}%`,
                background: q.completed ? '#4caf50' : '#c9a84c',
              }} />
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: '#777', fontFamily: 'Manrope, sans-serif' }}>
            {Math.min(q.progress, q.target)}/{q.target}
          </div>
        </div>
      ))}
    </div>
  );
}

interface LogPanelProps { log: string[]; }
export function LogPanel({ log }: LogPanelProps) {
  return (
    <div className="p-3">
      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c99' }}>Боевой журнал</div>
      <div className="space-y-0.5 max-h-32 overflow-y-auto scrollbar-thin">
        {log.slice(0, 20).map((entry, i) => (
          <div key={i} className="text-[10px] py-0.5 px-2 rounded"
            style={{
              color: i === 0 ? '#eee' : `rgba(200,200,200,${Math.max(0.2, 1 - i * 0.05)})`,
              background: i === 0 ? '#ffffff08' : 'transparent',
              fontFamily: 'Manrope, sans-serif',
            }}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
