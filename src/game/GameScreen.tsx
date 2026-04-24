import { useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from './useGame';
import GameCanvas from './GameCanvas';
import MiniMap from './MiniMap';
import { ResourceBar, RecruitPanel, LeaderboardPanel, QuestPanel, LogPanel } from './GameUI';
import { MAP_W, MAP_H } from './engine';
import { RANK_COLORS, PlayerRank } from './types';

// ── Экран лобби ───────────────────────────────────────────────────────────────
function LobbyScreen({ onStart }: { onStart: (name: string, bots: number) => void }) {
  const [name, setName] = useState('');
  const [bots, setBots] = useState(7);

  return (
    <div className="flex-1 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, hsl(222 20% 6%) 0%, hsl(222 30% 4%) 100%)', minHeight: 500 }}>
      <div className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: 'hsl(222 16% 9%)', border: '1px solid #c9a84c44', boxShadow: '0 0 60px #c9a84c15' }}>
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-1"
            style={{ fontFamily: '"Cinzel Decorative", serif', background: 'linear-gradient(135deg, #f0c060, #c9a84c, #8b6020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Medieval
          </h1>
          <h1 className="text-4xl font-black"
            style={{ fontFamily: '"Cinzel Decorative", serif', background: 'linear-gradient(135deg, #e05252, #c9303030, #8b1515)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Clash<span style={{ fontFamily: 'Manrope, sans-serif', fontSize: '0.6em', fontWeight: 300 }}>.io</span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: '#888', fontFamily: 'Manrope, sans-serif' }}>
            Захватывай точки · Нанимай войска · Побеждай
          </p>
        </div>

        {/* Форма */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c88', fontFamily: 'Manrope, sans-serif' }}>Твоё имя</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Полководец..."
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: '#ffffff08', border: '1px solid #c9a84c33', color: '#eee',
                fontFamily: 'Manrope, sans-serif',
              }}
              onFocus={e => (e.target.style.borderColor = '#c9a84c')}
              onBlur={e => (e.target.style.borderColor = '#c9a84c33')}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onStart(name.trim(), bots); }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c88', fontFamily: 'Manrope, sans-serif' }}>
              Противников: <span style={{ color: '#f0c060' }}>{bots}</span>
            </label>
            <input type="range" min={1} max={11} value={bots} onChange={e => setBots(+e.target.value)}
              className="w-full accent-yellow-500" />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: '#555', fontFamily: 'Manrope, sans-serif' }}>
              <span>1 (легко)</span><span>6 (норма)</span><span>11 (хаос)</span>
            </div>
          </div>

          <button
            onClick={() => onStart(name.trim() || 'Безымянный', bots)}
            className="w-full py-4 rounded-xl font-black text-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #8b6020)',
              color: '#1a1008', fontFamily: '"Cinzel Decorative", serif',
              boxShadow: '0 4px 20px #c9a84c44',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 30px #c9a84c66')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 20px #c9a84c44')}
          >
            ⚔️ В бой!
          </button>
        </div>

        {/* Подсказка управления */}
        <div className="mt-6 p-3 rounded-xl" style={{ background: '#ffffff05', border: '1px solid #ffffff0d' }}>
          <div className="text-xs text-center mb-2" style={{ color: '#c9a84c88', fontFamily: 'Manrope, sans-serif' }}>Управление</div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]" style={{ color: '#666', fontFamily: 'Manrope, sans-serif' }}>
            <span>🖱️ ЛКМ — приказ двигаться</span>
            <span>🖱️ ПКМ+тянуть — камера</span>
            <span>⚙️ Колёсико — зум</span>
            <span>🗺️ Мини-карта — телепорт</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Экран конца игры ──────────────────────────────────────────────────────────
function EndScreen({ state, onRestart }: { state: ReturnType<typeof useGame>['state']; onRestart: () => void }) {
  if (!state) return null;
  const winner = state.winner ? state.players[state.winner] : null;
  const human = state.players[state.humanPlayerId];
  const isWinner = state.winner === state.humanPlayerId;
  const rankColor = human ? RANK_COLORS[human.rank as PlayerRank] : '#888';

  return (
    <div className="flex-1 flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, hsl(222 20% 6%), hsl(222 30% 3%))', minHeight: 500 }}>
      <div className="w-full max-w-lg p-8 rounded-2xl text-center"
        style={{ background: 'hsl(222 16% 9%)', border: `1px solid ${isWinner ? '#c9a84c66' : '#c0303060'}`, boxShadow: `0 0 60px ${isWinner ? '#c9a84c20' : '#c0303020'}` }}>
        <div className="text-6xl mb-4">{isWinner ? '🏆' : '💀'}</div>
        <h2 className="text-3xl font-black mb-2"
          style={{ fontFamily: '"Cinzel Decorative", serif', color: isWinner ? '#f0c060' : '#e05252' }}>
          {isWinner ? 'Победа!' : 'Поражение'}
        </h2>
        {winner && (
          <p className="text-sm mb-6" style={{ color: '#888', fontFamily: 'Manrope, sans-serif' }}>
            {isWinner ? 'Ты покорил арену!' : `Победитель: ${winner.name}`}
          </p>
        )}

        {/* Статистика */}
        {human && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Очки', value: human.score, icon: '⭐' },
              { label: 'Убийств', value: human.kills, icon: '⚔️' },
              { label: 'Гибелей', value: human.deaths, icon: '💀' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3"
                style={{ background: '#ffffff08', border: '1px solid #ffffff15' }}>
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black" style={{ color: '#f0c060', fontFamily: '"Cinzel Decorative", serif' }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#666', fontFamily: 'Manrope, sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Ранг */}
        {human && (
          <div className="mb-6 px-4 py-2 rounded-xl inline-flex items-center gap-2"
            style={{ background: rankColor + '22', border: `1px solid ${rankColor}55` }}>
            <span className="text-sm font-bold" style={{ color: rankColor, fontFamily: 'Manrope, sans-serif' }}>
              Ранг: {human.rank}
            </span>
          </div>
        )}

        {/* Таблица лидеров */}
        <div className="mb-6 text-left">
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#c9a84c88', fontFamily: 'Manrope, sans-serif' }}>Итоговая таблица</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {state.leaderboard.map((e, i) => {
              const isMe = e.name === human?.name;
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: isMe ? '#f0c06015' : '#ffffff05', border: isMe ? '1px solid #f0c06030' : '1px solid transparent' }}>
                  <span className="text-xs w-5 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                  <span className="flex-1 text-xs truncate" style={{ color: isMe ? '#f0c060' : '#ccc', fontFamily: 'Manrope, sans-serif' }}>{e.name}</span>
                  <span className="text-xs font-mono" style={{ color: RANK_COLORS[e.rank] }}>{e.score}</span>
                  <span className="text-[10px] font-mono" style={{ color: '#555' }}>K/D {e.kd}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={onRestart} className="px-8 py-3 rounded-xl font-black text-base transition-all"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #8b6020)',
            color: '#1a1008', fontFamily: '"Cinzel Decorative", serif',
            boxShadow: '0 4px 20px #c9a84c44',
          }}>
          ⚔️ Новая битва
        </button>
      </div>
    </div>
  );
}

// ── Главный экран игры ────────────────────────────────────────────────────────
export default function GameScreen() {
  const { state, startGame, stopGame, restartGame, moveUnits, recruitUnit, buildTower } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [botCount, setBotCount] = useState(7);
  const [camera, setCamera] = useState({ x: MAP_W / 2, y: MAP_H / 2, zoom: 0.75 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState({ w: 900, h: 600 });

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setViewSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleStart = (name: string, bots: number) => {
    setPlayerName(name);
    setBotCount(bots);
    setCamera({ x: MAP_W / 2, y: MAP_H / 2, zoom: 0.75 });
    startGame(name, bots);
  };

  const handleRestart = () => {
    restartGame(playerName || 'Безымянный', botCount);
    setCamera({ x: MAP_W / 2, y: MAP_H / 2, zoom: 0.75 });
  };

  const handleMapClick = useCallback((x: number, y: number) => {
    moveUnits(x, y);
  }, [moveUnits]);

  const handleMiniClick = useCallback((worldX: number, worldY: number) => {
    setCamera(prev => ({ ...prev, x: worldX, y: worldY }));
  }, []);

  if (!state) {
    return <LobbyScreen onStart={handleStart} />;
  }

  if (state.phase === 'ended') {
    return <EndScreen state={state} onRestart={handleRestart} />;
  }

  const human = state.players[state.humanPlayerId];
  const isAlive = human?.alive ?? false;

  return (
    <div className="flex flex-col" style={{ height: '100%', minHeight: 0 }}>
      {/* Ресурсы */}
      <ResourceBar state={state} />

      <div className="flex flex-1 min-h-0" style={{ overflow: 'hidden' }}>
        {/* ── Игровое поле ── */}
        <div ref={containerRef} className="flex-1 relative" style={{ minWidth: 0, background: '#0d1a0d' }}>
          <GameCanvas
            state={state}
            onMapClick={handleMapClick}
            camera={camera}
            setCamera={setCamera}
          />

          {/* Мини-карта (поверх поля) */}
          <div className="absolute bottom-3 left-3 rounded-xl overflow-hidden"
            style={{ border: '1px solid #c9a84c55', boxShadow: '0 4px 16px #00000088' }}>
            <MiniMap state={state} camera={camera} onMiniClick={handleMiniClick} viewW={viewSize.w} viewH={viewSize.h} />
          </div>

          {/* Смерть игрока */}
          {!isAlive && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: '#00000088', backdropFilter: 'blur(2px)' }}>
              <div className="text-center p-8 rounded-2xl"
                style={{ background: '#1a0808dd', border: '1px solid #e0525255' }}>
                <div className="text-5xl mb-3">💀</div>
                <div className="text-2xl font-black mb-2" style={{ color: '#e05252', fontFamily: '"Cinzel Decorative", serif' }}>Ты пал в бою</div>
                <div className="text-sm mb-4" style={{ color: '#888', fontFamily: 'Manrope, sans-serif' }}>Игра продолжается...</div>
                <button onClick={handleRestart} className="px-6 py-2 rounded-xl font-bold text-sm"
                  style={{ background: '#c9a84c', color: '#1a1008', fontFamily: 'Manrope, sans-serif' }}>
                  Начать заново
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Правая панель ── */}
        <div className="flex flex-col overflow-y-auto scrollbar-thin"
          style={{ width: 240, background: 'hsl(222 18% 7%)', borderLeft: '1px solid #c9a84c22', flexShrink: 0 }}>
          <LeaderboardPanel state={state} />
          <div style={{ height: 1, background: '#c9a84c22' }} />
          <QuestPanel quests={state.quests} />
          <div style={{ height: 1, background: '#c9a84c22' }} />
          <LogPanel log={state.log} />
        </div>
      </div>

      {/* Нижняя панель найма */}
      <RecruitPanel state={state} onRecruit={recruitUnit} onBuildTower={buildTower} />
    </div>
  );
}
