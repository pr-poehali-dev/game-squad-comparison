import { useState, useEffect, useCallback, useRef } from 'react';
import { gameApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

/* ─── Константы ─── */
const COLS = 4;
const ROWS = 3;
const HOLES = COLS * ROWS; // 12 лунок
const GAME_DURATION = 60; // секунд

type HoleState = 'empty' | 'rising' | 'up' | 'hit' | 'hiding';

interface Hole {
  id: number;
  state: HoleState;
  timer: ReturnType<typeof setTimeout> | null;
}

/* ─── CSS-анимации (инлайн-стили через <style>) ─── */
const PIXEL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  .wham-root {
    font-family: 'Press Start 2P', monospace;
    image-rendering: pixelated;
  }

  @keyframes knightRise {
    0%   { transform: translateY(100%); }
    100% { transform: translateY(0%); }
  }
  @keyframes knightHide {
    0%   { transform: translateY(0%); }
    100% { transform: translateY(110%); }
  }
  @keyframes knightHit {
    0%   { transform: translateY(0%) scale(1); filter: brightness(3); }
    30%  { transform: translateY(-8px) scale(0.9) rotate(-6deg); filter: brightness(4) hue-rotate(40deg); }
    60%  { transform: translateY(20%) scale(0.85); filter: brightness(1); }
    100% { transform: translateY(110%); }
  }
  @keyframes hammerSwing {
    0%   { transform: rotate(0deg); }
    25%  { transform: rotate(-50deg) translateY(-4px); }
    55%  { transform: rotate(30deg) translateY(6px); }
    80%  { transform: rotate(-10deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes hitSplash {
    0%   { opacity: 1; transform: scale(0.4); }
    50%  { opacity: 1; transform: scale(1.3); }
    100% { opacity: 0; transform: scale(1.8); }
  }
  @keyframes screenShake {
    0%, 100% { transform: translate(0,0); }
    20%  { transform: translate(-3px, 2px); }
    40%  { transform: translate(3px, -2px); }
    60%  { transform: translate(-2px, 3px); }
    80%  { transform: translate(2px, -1px); }
  }
  @keyframes pixelBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes comboFloat {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-40px) scale(1.4); }
  }
  .wham-knight-rise  { animation: knightRise 0.25s ease-out forwards; }
  .wham-knight-hide  { animation: knightHide 0.3s ease-in forwards; }
  .wham-knight-hit   { animation: knightHit 0.4s ease-out forwards; }
  .wham-hammer-swing { animation: hammerSwing 0.35s ease-out forwards; }
  .wham-shake        { animation: screenShake 0.3s ease-out; }
  .wham-splash       { animation: hitSplash 0.45s ease-out forwards; }
  .wham-blink        { animation: pixelBlink 0.6s step-end infinite; }
  .wham-combo-float  { animation: comboFloat 0.8s ease-out forwards; }
`;

/* ─── Пиксельный рыцарь-клоун (герой) ─── */
function HeroKnight({ swinging }: { swinging: boolean }) {
  return (
    <div style={{ position: 'relative', width: 72, height: 96, imageRendering: 'pixelated' }}>
      {/* Тело */}
      <svg width="72" height="96" viewBox="0 0 18 24" style={{ imageRendering: 'pixelated' }}>
        {/* Причёска — разноцветная клоунская */}
        <rect x="4" y="0" width="10" height="3" fill="#ff3399" />
        <rect x="3" y="1" width="2" height="4" fill="#ff6600" />
        <rect x="13" y="1" width="2" height="4" fill="#00ccff" />
        <rect x="6" y="0" width="6" height="1" fill="#ffff00" />
        <rect x="5" y="1" width="8" height="1" fill="#ff3399" />
        {/* Шлем-основа */}
        <rect x="4" y="3" width="10" height="7" fill="#8899aa" />
        <rect x="3" y="5" width="12" height="5" fill="#99aabb" />
        {/* Забрало / клоунское лицо */}
        <rect x="5" y="5" width="8" height="5" fill="#ffcc88" />
        {/* Красный нос */}
        <rect x="8" y="8" width="2" height="2" fill="#ff2222" />
        {/* Глаза — большие клоунские */}
        <rect x="5" y="6" width="3" height="2" fill="#ffffff" />
        <rect x="10" y="6" width="3" height="2" fill="#ffffff" />
        <rect x="6" y="6" width="2" height="2" fill="#000000" />
        <rect x="11" y="6" width="2" height="2" fill="#000000" />
        <rect x="7" y="7" width="1" height="1" fill="#ffffff" />
        <rect x="12" y="7" width="1" height="1" fill="#ffffff" />
        {/* Улыбка клоуна */}
        <rect x="6" y="9" width="6" height="1" fill="#cc2222" />
        <rect x="5" y="8" width="1" height="2" fill="#cc2222" />
        <rect x="12" y="8" width="1" height="2" fill="#cc2222" />
        {/* Доспехи — нагрудник */}
        <rect x="4" y="10" width="10" height="8" fill="#778899" />
        <rect x="5" y="11" width="8" height="6" fill="#8899aa" />
        <rect x="7" y="12" width="4" height="4" fill="#99aacc" />
        {/* Горжет */}
        <rect x="5" y="9" width="8" height="2" fill="#99aaaa" />
        {/* Рукава */}
        <rect x="1" y="10" width="4" height="6" fill="#8899aa" />
        <rect x="13" y="10" width="4" height="6" fill="#8899aa" />
        {/* Рука с молотом (правая) */}
        <rect x="13" y="15" width="3" height="2" fill="#ffcc88" />
        {/* Нога левая */}
        <rect x="4" y="18" width="4" height="6" fill="#556677" />
        <rect x="4" y="22" width="5" height="2" fill="#445566" />
        {/* Нога правая */}
        <rect x="10" y="18" width="4" height="6" fill="#556677" />
        <rect x="9" y="22" width="5" height="2" fill="#445566" />
        {/* Пояс */}
        <rect x="4" y="17" width="10" height="2" fill="#667788" />
        <rect x="7" y="17" width="4" height="2" fill="#ffaa00" />
      </svg>

      {/* Молот */}
      <div
        className={swinging ? 'wham-hammer-swing' : ''}
        style={{
          position: 'absolute',
          right: -20,
          top: 16,
          transformOrigin: '8px 8px',
        }}
      >
        <svg width="36" height="48" viewBox="0 0 9 12" style={{ imageRendering: 'pixelated' }}>
          {/* Рукоять */}
          <rect x="3" y="4" width="2" height="8" fill="#8B5A2B" />
          {/* Голова молота */}
          <rect x="0" y="0" width="9" height="5" fill="#778899" />
          <rect x="1" y="1" width="7" height="3" fill="#99aabb" />
          {/* Засечки на молоте */}
          <rect x="0" y="2" width="2" height="1" fill="#667788" />
          <rect x="7" y="2" width="2" height="1" fill="#667788" />
          {/* Блик */}
          <rect x="2" y="1" width="3" height="1" fill="#bbccdd" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Пиксельный рыцарь-враг ─── */
function EnemyKnight({ state }: { state: HoleState }) {
  const animCls =
    state === 'rising'  ? 'wham-knight-rise' :
    state === 'hiding'  ? 'wham-knight-hide' :
    state === 'hit'     ? 'wham-knight-hit'  : '';

  return (
    <div
      className={animCls}
      style={{
        width: 48,
        height: 64,
        imageRendering: 'pixelated',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%) translateY(100%)',
        cursor: state === 'up' ? 'crosshair' : 'default',
        pointerEvents: state === 'up' ? 'auto' : 'none',
      }}
    >
      <svg width="48" height="64" viewBox="0 0 12 16" style={{ imageRendering: 'pixelated' }}>
        {/* Шлем */}
        <rect x="2" y="0" width="8" height="7" fill="#445566" />
        <rect x="1" y="2" width="10" height="5" fill="#556677" />
        {/* Забрало */}
        <rect x="3" y="3" width="6" height="4" fill="#334455" />
        {/* Щели забрала */}
        <rect x="3" y="3" width="2" height="1" fill="#88aacc" />
        <rect x="7" y="3" width="2" height="1" fill="#88aacc" />
        <rect x="3" y="5" width="6" height="1" fill="#445566" />
        {/* Гребень шлема */}
        <rect x="5" y="0" width="2" height="1" fill="#cc3300" />
        <rect x="4" y="0" width="4" height="1" fill="#cc3300" />
        {/* Плечи */}
        <rect x="0" y="6" width="12" height="3" fill="#445566" />
        {/* Нагрудник */}
        <rect x="2" y="9" width="8" height="5" fill="#445566" />
        <rect x="3" y="10" width="6" height="3" fill="#556677" />
        <rect x="4" y="10" width="4" height="3" fill="#667788" />
        {/* Руки */}
        <rect x="0" y="7" width="2" height="5" fill="#445566" />
        <rect x="10" y="7" width="2" height="5" fill="#445566" />
        {/* Ноги */}
        <rect x="2" y="14" width="3" height="2" fill="#334455" />
        <rect x="7" y="14" width="3" height="2" fill="#334455" />
        {/* Меч */}
        <rect x="11" y="3" width="1" height="8" fill="#aabbcc" />
        <rect x="10" y="4" width="3" height="1" fill="#889999" />
        <rect x="11" y="2" width="1" height="2" fill="#ccddee" />
      </svg>
    </div>
  );
}

/* ─── Анимация удара ─── */
function HitSplash({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="wham-splash"
      style={{
        position: 'fixed',
        left: x - 24,
        top: y - 24,
        width: 48,
        height: 48,
        pointerEvents: 'none',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
      }}
    >
      💥
    </div>
  );
}

/* ─── Плавающее комбо ─── */
function ComboFloat({ value, x, y }: { value: number; x: number; y: number }) {
  return (
    <div
      className="wham-combo-float"
      style={{
        position: 'fixed',
        left: x - 30,
        top: y - 20,
        pointerEvents: 'none',
        zIndex: 1000,
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: value >= 5 ? '#ffaa00' : '#00ffaa',
        textShadow: '0 0 8px currentColor',
        whiteSpace: 'nowrap',
      }}
    >
      {value >= 5 ? `x${value} 🔥` : `+${value}`}
    </div>
  );
}

interface LeaderRow {
  username: string;
  best_score: number;
  best_misses: number;
  games_played: number;
}

/* ─── Главный компонент ─── */
export default function WhamPage() {
  const { user } = useAuth();
  const [holes, setHoles] = useState<Hole[]>(
    Array.from({ length: HOLES }, (_, i) => ({ id: i, state: 'empty', timer: null }))
  );
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [swinging, setSwinging] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [combo, setCombo] = useState(0);
  const [splashes, setSplashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [combos, setCombos] = useState<{ id: number; value: number; x: number; y: number }[]>([]);
  const splashIdRef = useRef(0);

  // Рейтинг
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [scoreSaved, setScoreSaved] = useState(false);
  const finalScore = useRef(0);
  const finalMisses = useRef(0);

  const loadLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const data = await gameApi.leaderboard();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally {
      setLbLoading(false);
    }
  }, []);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  useEffect(() => { finalScore.current = score; }, [score]);
  useEffect(() => { finalMisses.current = misses; }, [misses]);

  const holesRef = useRef(holes);
  holesRef.current = holes;

  /* ─ Убрать рыцаря из лунки ─ */
  const hideHole = useCallback((id: number) => {
    setHoles(prev => {
      const next = [...prev];
      const h = { ...next[id] };
      if (h.timer) clearTimeout(h.timer);
      h.state = 'hiding';
      h.timer = setTimeout(() => {
        setHoles(p => {
          const n = [...p];
          n[id] = { ...n[id], state: 'empty', timer: null };
          return n;
        });
      }, 300);
      next[id] = h;
      return next;
    });
    setCombo(0);
  }, []);

  /* ─ Показать рыцаря в лунке ─ */
  const showHole = useCallback((id: number) => {
    setHoles(prev => {
      const next = [...prev];
      const h = { ...next[id] };
      if (h.state !== 'empty') return prev;
      if (h.timer) clearTimeout(h.timer);
      h.state = 'rising';
      h.timer = setTimeout(() => {
        setHoles(p => {
          const n = [...p];
          if (n[id].state !== 'hit') n[id] = { ...n[id], state: 'up' };
          return n;
        });
        const upTimer = setTimeout(() => {
          setHoles(p => {
            if (p[id].state === 'up') hideHole(id);
            return p;
          });
        }, 1000 + Math.random() * 1200);
        setHoles(p => {
          const n = [...p];
          if (n[id].state !== 'hit') n[id] = { ...n[id], timer: upTimer };
          return n;
        });
      }, 250);
      next[id] = h;
      return next;
    });
  }, [hideHole]);

  /* ─ Спавн рыцарей ─ */
  useEffect(() => {
    if (!running) return;
    let active = true;

    const spawn = () => {
      if (!active) return;
      const available = holesRef.current.filter(h => h.state === 'empty').map(h => h.id);
      if (available.length > 0) {
        const id = available[Math.floor(Math.random() * available.length)];
        showHole(id);
      }
      const delay = Math.max(400, 1100 - score * 3);
      setTimeout(spawn, delay);
    };
    const t = setTimeout(spawn, 400);
    return () => { active = false; clearTimeout(t); };
  }, [running, showHole, score]);

  /* ─ Таймер ─ */
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setRunning(false);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  /* ─ Сохранение результата при game over ─ */
  useEffect(() => {
    if (!gameOver || !user) return;
    setScoreSaved(false);
    gameApi.saveScore(finalScore.current, finalMisses.current)
      .then(() => { setScoreSaved(true); loadLeaderboard(); })
      .catch(() => {});
  }, [gameOver, user, loadLeaderboard]);

  /* ─ Удар по рыцарю ─ */
  const handleHit = useCallback((id: number, e: React.MouseEvent) => {
    const hole = holesRef.current[id];
    if (hole.state !== 'up') return;

    const cx = e.clientX;
    const cy = e.clientY;

    setHoles(prev => {
      const next = [...prev];
      const h = { ...next[id] };
      if (h.timer) clearTimeout(h.timer);
      h.state = 'hit';
      h.timer = setTimeout(() => {
        setHoles(p => {
          const n = [...p];
          n[id] = { ...n[id], state: 'empty', timer: null };
          return n;
        });
      }, 400);
      next[id] = h;
      return next;
    });

    setCombo(c => {
      const nc = c + 1;
      setScore(s => s + (nc >= 5 ? 3 : nc >= 3 ? 2 : 1));
      const sid = splashIdRef.current++;
      setSplashes(p => [...p, { id: sid, x: cx, y: cy }]);
      setTimeout(() => setSplashes(p => p.filter(s => s.id !== sid)), 450);
      if (nc >= 3) {
        const cid = splashIdRef.current++;
        setCombos(p => [...p, { id: cid, value: nc, x: cx, y: cy }]);
        setTimeout(() => setCombos(p => p.filter(s => s.id !== cid)), 800);
      }
      return nc;
    });

    setSwinging(true);
    setTimeout(() => setSwinging(false), 350);
  }, []);

  /* ─ Промах по пустому полю ─ */
  const handleMiss = useCallback(() => {
    setMisses(m => m + 1);
    setCombo(0);
    setShaking(true);
    setTimeout(() => setShaking(false), 300);
  }, []);

  /* ─ Старт ─ */
  const startGame = () => {
    setHoles(Array.from({ length: HOLES }, (_, i) => ({ id: i, state: 'empty', timer: null })));
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setCombo(0);
    setSplashes([]);
    setCombos([]);
    setGameOver(false);
    setScoreSaved(false);
    finalScore.current = 0;
    finalMisses.current = 0;
    setRunning(true);
  };

  const timerPct = timeLeft / GAME_DURATION;
  const timerColor = timerPct > 0.5 ? '#00ff88' : timerPct > 0.25 ? '#ffcc00' : '#ff3333';

  return (
    <div className="wham-root" style={{ userSelect: 'none' }}>
      <style>{PIXEL_CSS}</style>

      {/* Анимации */}
      {splashes.map(s => <HitSplash key={s.id} x={s.x} y={s.y} />)}
      {combos.map(c => <ComboFloat key={c.id} value={c.value} x={c.x} y={c.y} />)}

      {/* ── Шапка ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(10px, 2vw, 16px)',
          color: 'hsl(42 90% 52%)',
          textShadow: '2px 2px 0 #7a4500, 0 0 20px hsl(42 90% 52% / 0.4)',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}>
          ⚔ ИГРА В NEADEKVATA ⚔
        </h1>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: 'hsl(215 18% 45%)', letterSpacing: '0.1em' }}>
          Бей рыцарей молотом! Не упусти ни одного!
        </p>
      </div>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Игровое поле ── */}
        <div style={{ flex: '1 1 480px' }}>

          {/* HUD */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>

            {/* Счёт */}
            <div style={{
              padding: '8px 16px',
              background: 'hsl(224 20% 9%)',
              border: '2px solid hsl(42 90% 52% / 0.4)',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 10,
              color: 'hsl(42 90% 55%)',
              imageRendering: 'pixelated',
            }}>
              SCORE: {score.toString().padStart(4, '0')}
            </div>

            {/* Таймер */}
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: timerColor, marginBottom: 4 }}>
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <div style={{ height: 8, background: 'hsl(224 20% 9%)', border: '2px solid hsl(215 18% 25%)' }}>
                <div style={{ height: '100%', width: `${timerPct * 100}%`, background: timerColor, transition: 'width 0.9s linear, background 0.5s' }} />
              </div>
            </div>

            {/* Комбо */}
            {combo >= 3 && (
              <div style={{
                padding: '8px 12px',
                background: 'hsl(40 90% 52% / 0.15)',
                border: '2px solid hsl(40 90% 52%)',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 8,
                color: '#ffaa00',
                textShadow: '0 0 8px #ffaa00',
              }}>
                COMBO x{combo}!
              </div>
            )}

            {/* Промахи */}
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: 'hsl(0 60% 55%)' }}>
              MISS: {misses}
            </div>
          </div>

          {/* Поле с лунками */}
          <div
            className={shaking ? 'wham-shake' : ''}
            onClick={running ? handleMiss : undefined}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gap: 12,
              padding: 20,
              background: 'linear-gradient(180deg, hsl(224 20% 7%) 0%, hsl(220 20% 5%) 100%)',
              border: '3px solid hsl(42 90% 52% / 0.25)',
              borderRadius: 2,
              cursor: running ? 'crosshair' : 'default',
              position: 'relative',
            }}
          >
            {/* Декоративные пиксельные углы */}
            {[{ top: 6, left: 6 }, { top: 6, right: 6 }, { bottom: 6, left: 6 }, { bottom: 6, right: 6 }].map((pos, i) => (
              <div key={i} style={{ position: 'absolute', width: 8, height: 8, background: 'hsl(42 90% 52% / 0.5)', ...pos }} />
            ))}

            {holes.map(hole => (
              <div
                key={hole.id}
                style={{
                  position: 'relative',
                  height: 80,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
                onClick={e => { if (hole.state === 'up') { e.stopPropagation(); handleHit(hole.id, e); } }}
              >
                {/* Дыра-лунка */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 52,
                  height: 18,
                  background: 'hsl(220 20% 4%)',
                  border: '2px solid hsl(215 18% 18%)',
                  borderRadius: '50%',
                  boxShadow: 'inset 0 4px 12px hsl(0 0% 0% / 0.8)',
                  zIndex: 2,
                }} />

                {/* Земля */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 10,
                  background: 'hsl(28 30% 18%)',
                  zIndex: 1,
                }} />

                {/* Рыцарь */}
                {hole.state !== 'empty' && (
                  <div style={{ position: 'absolute', bottom: 8, zIndex: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <EnemyKnight state={hole.state} />
                  </div>
                )}

                {/* Звезды при ударе */}
                {hole.state === 'hit' && (
                  <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', zIndex: 10, fontSize: 18 }}>
                    ✨
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Кнопки */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {!running && !gameOver && (
              <button
                onClick={startGame}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 10,
                  padding: '10px 20px',
                  background: 'hsl(42 90% 52%)',
                  color: 'hsl(224 20% 6%)',
                  border: '3px solid hsl(42 90% 38%)',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0 hsl(42 90% 28%)',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  imageRendering: 'pixelated',
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 hsl(42 90% 28%)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 hsl(42 90% 28%)'; }}
              >
                ▶ НАЧАТЬ
              </button>
            )}
            {running && (
              <button
                onClick={() => { setRunning(false); setGameOver(true); }}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 8,
                  padding: '10px 16px',
                  background: 'hsl(0 60% 40%)',
                  color: '#fff',
                  border: '3px solid hsl(0 60% 28%)',
                  cursor: 'pointer',
                  boxShadow: '3px 3px 0 hsl(0 60% 18%)',
                  imageRendering: 'pixelated',
                }}
              >
                ⏹ СТОП
              </button>
            )}
          </div>
        </div>

        {/* ── Персонаж-герой ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 40 }}>
          <HeroKnight swinging={swinging} />
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 6,
            color: 'hsl(42 90% 52% / 0.6)',
            textAlign: 'center',
            maxWidth: 110,
            lineHeight: 1.8,
          }}>
            СЭР<br />НЕАДЕКВАТ
          </div>
          {/* Рейтинг */}
          <div style={{
            marginTop: 8,
            padding: '8px 12px',
            background: 'hsl(224 20% 9%)',
            border: '2px solid hsl(42 90% 52% / 0.3)',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 6,
            color: 'hsl(215 18% 45%)',
            textAlign: 'center',
            lineHeight: 2,
          }}>
            <div style={{ color: 'hsl(42 90% 52%)', marginBottom: 4 }}>КАК ИГРАТЬ</div>
            <div>Кликай по</div>
            <div>рыцарям!</div>
            <div style={{ marginTop: 4 }}>Комбо x3 = 2 очка</div>
            <div>Комбо x5 = 3 очка</div>
          </div>
        </div>
      </div>

      {/* ── Game Over экран ── */}
      {gameOver && (
        <div style={{
          marginTop: 24,
          padding: 24,
          background: 'hsl(224 20% 7%)',
          border: '3px solid hsl(42 90% 52% / 0.5)',
          textAlign: 'center',
          maxWidth: 480,
          imageRendering: 'pixelated',
        }}>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(12px, 3vw, 20px)',
            color: 'hsl(42 90% 52%)',
            textShadow: '2px 2px 0 #7a4500',
            marginBottom: 16,
          }}>
            GAME OVER
          </div>

          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: 'hsl(38 15% 70%)', marginBottom: 8 }}>
            ИТОГ: {score} ОЧКОВ
          </div>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: 'hsl(0 60% 55%)', marginBottom: 16 }}>
            ПРОМАХОВ: {misses}
          </div>

          {/* Звание */}
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            color: score >= 40 ? '#ffaa00' : score >= 20 ? '#aaddff' : '#778899',
            textShadow: score >= 40 ? '0 0 12px #ffaa00' : 'none',
            marginBottom: 16,
            lineHeight: 2,
          }}>
            {score >= 60 ? '👑 ЛЕГЕНДА ТУРНИРА' :
             score >= 40 ? '⚔ МАСТЕР МОЛОТА' :
             score >= 20 ? '🛡 ДОСТОЙНЫЙ РЫЦАРЬ' :
             '🤡 НОВОБРАНЕЦ'}
          </div>

          {/* Статус сохранения */}
          {user ? (
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, marginBottom: 16,
              color: scoreSaved ? '#00ff88' : 'hsl(215 18% 45%)' }}>
              {scoreSaved ? '✓ РЕЗУЛЬТАТ СОХРАНЁН' : '... СОХРАНЯЮ...'}
            </div>
          ) : (
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, marginBottom: 16, color: 'hsl(42 90% 52% / 0.6)', lineHeight: 2 }}>
              Войди в аккаунт,<br />чтобы попасть в рейтинг!
            </div>
          )}

          <button
            onClick={startGame}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 10,
              padding: '12px 24px',
              background: 'hsl(42 90% 52%)',
              color: 'hsl(224 20% 6%)',
              border: '3px solid hsl(42 90% 38%)',
              cursor: 'pointer',
              boxShadow: '3px 3px 0 hsl(42 90% 28%)',
              imageRendering: 'pixelated',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px, 2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 hsl(42 90% 28%)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 hsl(42 90% 28%)'; }}
          >
            ↺ СНОВА
          </button>
        </div>
      )}

      {/* ── Таблица рейтинга ── */}
      <div style={{ marginTop: 32, maxWidth: 600 }}>
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 11,
          color: 'hsl(42 90% 52%)',
          textShadow: '2px 2px 0 #7a4500',
          marginBottom: 16,
          letterSpacing: '0.08em',
        }}>
          🏆 ТАБЛИЦА РЕЙТИНГА
        </div>

        <div style={{
          background: 'hsl(224 20% 7%)',
          border: '3px solid hsl(42 90% 52% / 0.3)',
          overflow: 'hidden',
        }}>
          {/* Шапка */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 90px 70px 60px',
            gap: 0,
            padding: '10px 14px',
            background: 'hsl(42 90% 52% / 0.1)',
            borderBottom: '2px solid hsl(42 90% 52% / 0.25)',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 6,
            color: 'hsl(42 90% 52%)',
            letterSpacing: '0.06em',
          }}>
            <div>#</div>
            <div>ИГРОК</div>
            <div style={{ textAlign: 'right' }}>РЕКОРД</div>
            <div style={{ textAlign: 'right' }}>ПРОМАХИ</div>
            <div style={{ textAlign: 'right' }}>ИГР</div>
          </div>

          {lbLoading ? (
            <div style={{ padding: '24px', textAlign: 'center', fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: 'hsl(215 18% 40%)' }}>
              ЗАГРУЗКА...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: 'hsl(215 18% 40%)', lineHeight: 2 }}>
              Пока никто не играл.<br />Будь первым!
            </div>
          ) : (
            leaderboard.map((row, idx) => {
              const isMe = user?.username === row.username;
              const medals = ['🥇', '🥈', '🥉'];
              const place = idx < 3 ? medals[idx] : `${idx + 1}`;
              const isTop = idx < 3;
              return (
                <div
                  key={row.username}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 90px 70px 60px',
                    gap: 0,
                    padding: '9px 14px',
                    borderBottom: '1px solid hsl(215 18% 12%)',
                    background: isMe
                      ? 'hsl(42 90% 52% / 0.08)'
                      : isTop ? 'hsl(224 20% 9%)' : 'transparent',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 7,
                    alignItems: 'center',
                    borderLeft: isMe ? '3px solid hsl(42 90% 52%)' : '3px solid transparent',
                  }}
                >
                  <div style={{ fontSize: idx < 3 ? 14 : 7, color: isTop ? 'hsl(42 90% 52%)' : 'hsl(215 18% 35%)' }}>
                    {place}
                  </div>
                  <div style={{ color: isMe ? 'hsl(42 90% 55%)' : 'hsl(38 15% 72%)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.username}{isMe ? ' ◀' : ''}
                  </div>
                  <div style={{ textAlign: 'right', color: isTop ? '#ffdd66' : 'hsl(38 15% 60%)', fontWeight: 700 }}>
                    {row.best_score}
                  </div>
                  <div style={{ textAlign: 'right', color: 'hsl(0 60% 55%)' }}>
                    {row.best_misses}
                  </div>
                  <div style={{ textAlign: 'right', color: 'hsl(215 18% 40%)' }}>
                    {row.games_played}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 10, fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: 'hsl(215 18% 30%)', lineHeight: 2 }}>
          Топ-20 · Учитывается лучший результат за все игры
        </div>
      </div>
    </div>
  );
}