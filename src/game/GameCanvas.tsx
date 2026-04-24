import { useRef, useEffect, useCallback } from 'react';
import { GameState, UnitClass } from './types';
import { MAP_W, MAP_H } from './engine';

interface Props {
  state: GameState;
  onMapClick: (x: number, y: number) => void;
  camera: { x: number; y: number; zoom: number };
  setCamera: (fn: (prev: { x: number; y: number; zoom: number }) => { x: number; y: number; zoom: number }) => void;
}

// ── Статичные элементы карты (генерируются один раз) ─────────────────────────
interface MapDecor {
  trees: { x: number; y: number; r: number; variant: number }[];
  rocks: { x: number; y: number; r: number }[];
  patches: { x: number; y: number; w: number; h: number; type: 'dark' | 'light' | 'mud' }[];
  roads: { x1: number; y1: number; x2: number; y2: number }[];
  river: { x: number; y: number }[];
}

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateMapDecor(): MapDecor {
  const rnd = seededRand(42);
  const trees: MapDecor['trees'] = [];
  const treeZones = [
    { cx: 60,          cy: 60,          spread: 140, count: 22 },
    { cx: MAP_W - 60,  cy: 60,          spread: 140, count: 20 },
    { cx: 60,          cy: MAP_H - 60,  spread: 140, count: 20 },
    { cx: MAP_W - 60,  cy: MAP_H - 60,  spread: 140, count: 22 },
    { cx: MAP_W / 2,   cy: 40,          spread: 120, count: 14 },
    { cx: MAP_W / 2,   cy: MAP_H - 40,  spread: 120, count: 14 },
    { cx: 40,          cy: MAP_H / 2,   spread: 80,  count: 10 },
    { cx: MAP_W - 40,  cy: MAP_H / 2,   spread: 80,  count: 10 },
    { cx: 200,         cy: 400,         spread: 70,  count: 8  },
    { cx: MAP_W - 200, cy: 500,         spread: 70,  count: 8  },
    { cx: 500,         cy: 700,         spread: 60,  count: 7  },
    { cx: 700,         cy: 200,         spread: 60,  count: 7  },
  ];
  for (const z of treeZones) {
    for (let i = 0; i < z.count; i++) {
      const angle = rnd() * Math.PI * 2;
      trees.push({
        x: z.cx + Math.cos(angle) * rnd() * z.spread,
        y: z.cy + Math.sin(angle) * rnd() * z.spread,
        r: 8 + rnd() * 10,
        variant: Math.floor(rnd() * 3),
      });
    }
  }

  const rocks: MapDecor['rocks'] = [];
  for (let i = 0; i < 30; i++) {
    rocks.push({ x: rnd() * MAP_W, y: rnd() * MAP_H, r: 4 + rnd() * 7 });
  }

  const patches: MapDecor['patches'] = [];
  const patchTypes: MapDecor['patches'][number]['type'][] = ['dark', 'light', 'mud'];
  for (let i = 0; i < 18; i++) {
    patches.push({ x: rnd() * MAP_W, y: rnd() * MAP_H, w: 60 + rnd() * 120, h: 40 + rnd() * 80, type: patchTypes[Math.floor(rnd() * 3)] });
  }

  const roads: MapDecor['roads'] = [
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: 300,          y2: MAP_H / 2        },
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: MAP_W - 300,  y2: MAP_H / 2        },
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: MAP_W / 2,    y2: 250              },
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: MAP_W / 2,    y2: MAP_H - 250      },
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: 400,           y2: 220              },
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: MAP_W - 400,   y2: 220              },
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: 400,           y2: MAP_H - 220      },
    { x1: MAP_W / 2, y1: MAP_H / 2, x2: MAP_W - 400,   y2: MAP_H - 220      },
  ];

  const river: { x: number; y: number }[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    river.push({ x: MAP_W * 0.68 + Math.sin(t * Math.PI * 3) * 60, y: t * MAP_H });
  }

  return { trees, rocks, patches, roads, river };
}

const MAP_DECOR = generateMapDecor();

// ── Скины юнитов (нарисованные на canvas) ────────────────────────────────────
function drawUnitSkin(
  ctx: CanvasRenderingContext2D,
  unitClass: UnitClass,
  x: number, y: number,
  teamColor: string,
  facing: number,
  isHuman: boolean,
  anim: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(facing);
  const sc = isHuman ? 1.15 : 1.0;
  ctx.scale(sc, sc);
  switch (unitClass) {
    case 'infantry': drawInfantry(ctx, teamColor, anim); break;
    case 'archer':   drawArcher(ctx, teamColor, anim);   break;
    case 'cavalry':  drawCavalry(ctx, teamColor, anim);  break;
    case 'knight':   drawKnight(ctx, teamColor, anim);   break;
    case 'engineer': drawEngineer(ctx, teamColor, anim); break;
  }
  ctx.restore();
}

function drawInfantry(ctx: CanvasRenderingContext2D, color: string, anim: number) {
  // Тело
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 2, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
  // Нагрудник
  ctx.fillStyle = '#c8d0d8';
  ctx.beginPath(); ctx.ellipse(0, 1, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
  // Голова
  ctx.fillStyle = '#f5d5a0';
  ctx.beginPath(); ctx.arc(0, -9, 5, 0, Math.PI * 2); ctx.fill();
  // Шлем
  ctx.fillStyle = '#8899aa';
  ctx.beginPath(); ctx.arc(0, -10, 5.5, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#667788'; ctx.fillRect(-3, -11, 6, 2.5);
  // Меч
  ctx.save(); ctx.rotate(Math.sin(anim * Math.PI * 2) * 0.3);
  ctx.fillStyle = '#d4d0c8'; ctx.fillRect(7, -12, 2.5, 14);
  ctx.fillStyle = '#8b5e3c'; ctx.fillRect(6, 1, 5, 3);
  ctx.restore();
  // Щит
  ctx.fillStyle = color; ctx.strokeStyle = '#c8d0d8'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, -8); ctx.lineTo(-13, -3); ctx.lineTo(-13, 5); ctx.lineTo(-9, 9); ctx.lineTo(-6, 5); ctx.lineTo(-6, -3);
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

function drawArcher(ctx: CanvasRenderingContext2D, color: string, anim: number) {
  ctx.fillStyle = color + 'cc';
  ctx.beginPath(); ctx.ellipse(0, 3, 6, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8b6040';
  ctx.beginPath(); ctx.ellipse(0, 1, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f5d5a0';
  ctx.beginPath(); ctx.arc(0, -8, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -9, 5, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-5, -9); ctx.lineTo(-6, -4); ctx.lineTo(6, -4); ctx.lineTo(5, -9); ctx.closePath(); ctx.fill();
  // Лук
  ctx.save(); ctx.rotate(Math.sin(anim * Math.PI * 2) * 0.15);
  ctx.strokeStyle = '#6b4020'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(9, 0, 10, -Math.PI / 2.5, Math.PI / 2.5); ctx.stroke();
  ctx.restore();
  // Стрела
  ctx.strokeStyle = '#8b6040'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(3, -4); ctx.lineTo(18, -4); ctx.stroke();
  ctx.fillStyle = '#c0c0c0';
  ctx.beginPath(); ctx.moveTo(18,-4); ctx.lineTo(22,-4); ctx.lineTo(19,-2); ctx.lineTo(19,-6); ctx.closePath(); ctx.fill();
  // Колчан
  ctx.fillStyle = '#6b4020'; ctx.fillRect(-8, -3, 4, 10);
}

function drawCavalry(ctx: CanvasRenderingContext2D, color: string, anim: number) {
  const g = Math.sin(anim * Math.PI * 2);
  // Тело лошади
  ctx.fillStyle = '#7a5030';
  ctx.beginPath(); ctx.ellipse(0, 5, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color + 'bb';
  ctx.beginPath(); ctx.ellipse(0, 4, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
  // Голова лошади
  ctx.fillStyle = '#6a4020';
  ctx.beginPath(); ctx.ellipse(14, 1, 6, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a6040';
  ctx.beginPath(); ctx.moveTo(18,-3); ctx.lineTo(20,-7); ctx.lineTo(22,-3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2010';
  ctx.beginPath(); ctx.ellipse(10, -2, 4, 2.5, 0.5, 0, Math.PI * 2); ctx.fill();
  // Ноги
  ctx.strokeStyle = '#6a4020'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const l of [{bx:8,by:10,lg:g*6},{bx:2,by:12,lg:-g*5},{bx:-4,by:12,lg:g*5},{bx:-10,by:10,lg:-g*6}]) {
    ctx.beginPath(); ctx.moveTo(l.bx, l.by); ctx.lineTo(l.bx + l.lg * 0.3, l.by + 8 + Math.abs(l.lg)*0.2); ctx.stroke();
  }
  // Хвост
  ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-13,3); ctx.bezierCurveTo(-18,0,-20,5+g*3,-17,12); ctx.stroke();
  // Всадник
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(2, -8, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a0aab4';
  ctx.beginPath(); ctx.ellipse(2, -9, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f5d5a0';
  ctx.beginPath(); ctx.arc(2, -16, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7788aa';
  ctx.beginPath(); ctx.arc(2, -17, 4.5, Math.PI, 0); ctx.fill(); ctx.fillRect(0.5, -22, 3, 6);
  ctx.fillStyle = color; ctx.fillRect(0.5,-22,3,6);
  // Копьё
  ctx.strokeStyle = '#6b4020'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(8,-14); ctx.lineTo(26,-22+g*2); ctx.stroke();
  ctx.fillStyle = '#c0c0c0';
  ctx.beginPath(); ctx.moveTo(26,-22+g*2); ctx.lineTo(30,-20+g*2); ctx.lineTo(27,-17+g*2); ctx.closePath(); ctx.fill();
}

function drawKnight(ctx: CanvasRenderingContext2D, color: string, anim: number) {
  const sw = Math.sin(anim * Math.PI * 2) * 0.4;
  // Тело в латах
  ctx.fillStyle = '#7a8898';
  ctx.beginPath(); ctx.ellipse(0, 2, 9, 11, 0, 0, Math.PI * 2); ctx.fill();
  const ng = ctx.createLinearGradient(-7,-8,7,8);
  ng.addColorStop(0,'#d8e8f0'); ng.addColorStop(1,'#8899aa');
  ctx.fillStyle = ng;
  ctx.beginPath(); ctx.ellipse(0, 0, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,6); ctx.moveTo(-5,0); ctx.lineTo(5,0); ctx.stroke();
  // Наплечники
  ctx.fillStyle = '#8899aa';
  ctx.beginPath(); ctx.ellipse(-9,-4,4,3,-0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9,-4,4,3,0.3,0,Math.PI*2); ctx.fill();
  // Голова
  ctx.fillStyle = '#f5d5a0';
  ctx.beginPath(); ctx.arc(0,-13,5.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#889ab0';
  ctx.beginPath(); ctx.arc(0,-14,6.5,Math.PI,0); ctx.fill();
  ctx.fillRect(-6.5,-17,13,5);
  ctx.fillStyle = '#222'; ctx.fillRect(-5,-15,10,2);
  ctx.fillStyle = '#aa0000'; ctx.fillRect(-4,-15,8,2);
  // Большой меч
  ctx.save(); ctx.rotate(sw);
  const sg = ctx.createLinearGradient(-1,-20,3,12);
  sg.addColorStop(0,'#e8eef4'); sg.addColorStop(0.5,'#c0ccd8'); sg.addColorStop(1,'#8899aa');
  ctx.fillStyle = sg; ctx.fillRect(10,-24,3,22);
  ctx.fillStyle = color; ctx.fillRect(7,-3,9,3);
  ctx.fillStyle = '#4a3020'; ctx.fillRect(10.5,0,2,8);
  ctx.fillStyle = '#c8a840';
  ctx.beginPath(); ctx.arc(11.5,9,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // Щит
  const shg = ctx.createLinearGradient(-18,-8,-8,10);
  shg.addColorStop(0,'#c8d8e8'); shg.addColorStop(1,'#7a8898');
  ctx.fillStyle = shg;
  ctx.beginPath();
  ctx.moveTo(-10,-12); ctx.lineTo(-17,-5); ctx.lineTo(-17,6); ctx.lineTo(-10,14); ctx.lineTo(-6,6); ctx.lineTo(-6,-5);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = color+'cc'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(-11.5,1,3.5,0,Math.PI*2); ctx.stroke();
}

function drawEngineer(ctx: CanvasRenderingContext2D, color: string, anim: number) {
  ctx.fillStyle = '#6b4020';
  ctx.beginPath(); ctx.ellipse(0,4,7,10,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = color+'cc';
  ctx.beginPath(); ctx.ellipse(0,0,5.5,7,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4a2810'; ctx.fillRect(-5,2,3.5,4); ctx.fillRect(1.5,2,3.5,4);
  ctx.fillStyle = '#f5d5a0';
  ctx.beginPath(); ctx.arc(0,-9,4.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8b6030';
  ctx.beginPath(); ctx.ellipse(0,-7,3,2.5,0,0,Math.PI); ctx.fill();
  ctx.fillStyle = '#c8a030';
  ctx.beginPath(); ctx.arc(0,-10,5,Math.PI,0); ctx.fill();
  ctx.fillRect(-6,-10,12,2);
  // Молот
  ctx.save(); ctx.rotate(Math.sin(anim*Math.PI*2)*0.5);
  ctx.strokeStyle = '#6b4020'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(6,2); ctx.lineTo(16,-12); ctx.stroke();
  ctx.save(); ctx.translate(16,-12); ctx.rotate(0.7);
  ctx.fillStyle = '#9aa0a8'; ctx.fillRect(-4,-5,8,4);
  ctx.fillStyle = '#c0c8d0'; ctx.fillRect(-3,-5,6,2);
  ctx.restore(); ctx.restore();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-8,6); ctx.lineTo(-6,10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6,6); ctx.lineTo(-4,11); ctx.stroke();
}

// ── Миниатюры построек на точках захвата ─────────────────────────────────────
function drawMiniCastle(ctx: CanvasRenderingContext2D, color: string, owned: boolean) {
  const c = owned ? color : '#667788';
  ctx.fillStyle = '#3a3830'; ctx.fillRect(-8,-20,16,22);
  ctx.fillStyle = c+'aa'; ctx.fillRect(-7,-19,14,20);
  ctx.fillStyle = '#3a3830';
  for (let i = -7; i <= 5; i += 4) ctx.fillRect(i,-22,3,4);
  ctx.fillStyle = '#1a1612';
  ctx.beginPath(); ctx.arc(0,1,4,Math.PI,0); ctx.fillRect(-4,1,8,5); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(0,-28); ctx.stroke();
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(0,-28); ctx.lineTo(7,-25); ctx.lineTo(0,-22); ctx.closePath(); ctx.fill();
  for (const bx of [-12, 12]) {
    ctx.fillStyle = '#2a2820'; ctx.fillRect(bx-4,-14,8,16);
    for (let zi = bx-4; zi<=bx+2; zi+=3) { ctx.fillStyle='#1a1612'; ctx.fillRect(zi,-15,2,3); }
  }
}

function drawMiniMine(ctx: CanvasRenderingContext2D, color: string, owned: boolean) {
  const c = owned ? color : '#776644';
  ctx.fillStyle = '#2a2418';
  ctx.beginPath(); ctx.arc(0,0,14,Math.PI,0); ctx.fillRect(-14,0,28,12); ctx.fill();
  ctx.strokeStyle = '#5a4830'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0,0,10,Math.PI,0); ctx.stroke();
  ctx.fillStyle = '#0a0806';
  ctx.beginPath(); ctx.arc(0,0,8,Math.PI,0); ctx.fillRect(-8,0,16,8); ctx.fill();
  ctx.fillStyle = '#4a3820';
  ctx.beginPath(); ctx.moveTo(-16,0); ctx.lineTo(0,-16); ctx.lineTo(16,0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c+'88';
  ctx.beginPath(); ctx.moveTo(-14,0); ctx.lineTo(0,-14); ctx.lineTo(14,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8,8); ctx.lineTo(8,8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,5); ctx.lineTo(-6,11); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,5); ctx.lineTo(6,11); ctx.stroke();
}

function drawMiniFarm(ctx: CanvasRenderingContext2D, color: string, owned: boolean) {
  const c = owned ? color : '#888866';
  for (let r = 0; r < 4; r++) { ctx.fillStyle = r%2===0?'#3a5a18':'#304e14'; ctx.fillRect(-18,-18+r*9,36,9); }
  ctx.strokeStyle = c; ctx.lineWidth = 1.5;
  for (let col = -14; col <= 14; col += 6) {
    for (let row = 0; row < 4; row++) {
      const wx = col + Math.sin(col*0.5)*2, wy = -14 + row*9;
      ctx.beginPath(); ctx.moveTo(wx,wy+5); ctx.lineTo(wx,wy); ctx.stroke();
      ctx.fillStyle = owned?'#d4a830':'#b09020';
      ctx.beginPath(); ctx.ellipse(wx,wy-2,1.5,3,0,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.fillStyle = '#5a2818'; ctx.fillRect(-6,-20,12,16);
  ctx.fillStyle = '#8b4020';
  ctx.beginPath(); ctx.moveTo(-8,-20); ctx.lineTo(0,-28); ctx.lineTo(8,-20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0,-28); ctx.lineTo(0,-33); ctx.stroke();
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(0,-33); ctx.lineTo(6,-31); ctx.lineTo(0,-29); ctx.closePath(); ctx.fill();
}

function drawMiniTower(ctx: CanvasRenderingContext2D, color: string, owned: boolean) {
  const c = owned ? color : '#667788';
  ctx.fillStyle = '#2a2820';
  ctx.beginPath(); ctx.arc(0,0,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3a3830'; ctx.fillRect(-9,-18,18,20);
  ctx.fillStyle = c+'55'; ctx.fillRect(-8,-17,16,18);
  ctx.fillStyle = '#2a2820';
  for (let i = -8; i <= 6; i += 4) ctx.fillRect(i,-19,3,3.5);
  ctx.fillStyle = '#1a1612'; ctx.fillRect(-4,-10,3,5); ctx.fillRect(2,-10,3,5);
  ctx.strokeStyle = c; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0,-19); ctx.lineTo(0,-26); ctx.stroke();
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(0,-26); ctx.lineTo(6,-23); ctx.lineTo(0,-20); ctx.closePath(); ctx.fill();
}

// ── Основной компонент ────────────────────────────────────────────────────────
export default function GameCanvas({ state, onMapClick, camera, setCamera }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const tickRef = useRef(0);

  useEffect(() => { tickRef.current = state.tick; }, [state.tick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(-camera.x * camera.zoom + W / 2, -camera.y * camera.zoom + H / 2);
    ctx.scale(camera.zoom, camera.zoom);

    renderBackground(ctx);
    renderDecorUnder(ctx);
    renderCapturePoints(ctx, state);
    renderDecorOver(ctx);
    renderBuildings(ctx, state);
    renderUnits(ctx, state, tickRef.current);
    renderCommanders(ctx, state, tickRef.current);

    ctx.restore();
  });

  function renderBackground(ctx: CanvasRenderingContext2D) {
    const g = ctx.createRadialGradient(MAP_W/2, MAP_H/2, 0, MAP_W/2, MAP_H/2, MAP_W*0.75);
    g.addColorStop(0, '#2a4020'); g.addColorStop(0.4, '#223318'); g.addColorStop(0.8, '#1a2812'); g.addColorStop(1, '#121e0e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, MAP_W, MAP_H);
    ctx.globalAlpha = 0.06;
    for (const p of MAP_DECOR.patches) {
      ctx.fillStyle = p.type==='dark'?'#000':p.type==='light'?'#7ab050':'#6b4820';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.w/2, p.h/2, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function renderDecorUnder(ctx: CanvasRenderingContext2D) {
    // Река
    const rv = MAP_DECOR.river;
    ctx.save(); ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#1e4870'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(rv[0].x, rv[0].y);
    for (let i = 1; i < rv.length; i++) ctx.lineTo(rv[i].x, rv[i].y);
    ctx.stroke();
    ctx.strokeStyle = '#4090d0'; ctx.lineWidth = 5; ctx.globalAlpha = 0.18;
    ctx.stroke(); ctx.restore();

    // Дороги
    for (const r of MAP_DECOR.roads) {
      ctx.save();
      ctx.strokeStyle = '#5a4020'; ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(r.x1,r.y1); ctx.lineTo(r.x2,r.y2); ctx.stroke();
      ctx.strokeStyle = '#8b6840'; ctx.lineWidth = 8; ctx.globalAlpha = 0.45; ctx.stroke();
      ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 1; ctx.setLineDash([20,15]); ctx.globalAlpha = 0.18; ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
    }

    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.022)'; ctx.lineWidth = 0.5;
    for (let x = 0; x <= MAP_W; x += 60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,MAP_H); ctx.stroke(); }
    for (let y = 0; y <= MAP_H; y += 60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(MAP_W,y); ctx.stroke(); }

    // Рамка
    ctx.strokeStyle = '#c9a84c'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, MAP_W-4, MAP_H-4);
    ctx.strokeStyle = '#c9a84c55'; ctx.lineWidth = 1; ctx.strokeRect(8, 8, MAP_W-16, MAP_H-16);
    for (const [cx, cy] of [[16,16],[MAP_W-16,16],[16,MAP_H-16],[MAP_W-16,MAP_H-16]] as [number,number][]) {
      ctx.strokeStyle = '#c9a84c88'; ctx.lineWidth = 1.5;
      for (const rr of [10, 18]) { ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.stroke(); }
    }
  }

  function renderDecorOver(ctx: CanvasRenderingContext2D) {
    // Камни
    for (const rock of MAP_DECOR.rocks) {
      const rg = ctx.createRadialGradient(rock.x-rock.r*0.3, rock.y-rock.r*0.3, 0, rock.x, rock.y, rock.r);
      rg.addColorStop(0,'#8899aa'); rg.addColorStop(1,'#445566');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.ellipse(rock.x, rock.y, rock.r, rock.r*0.7, 0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#00000033';
      ctx.beginPath(); ctx.ellipse(rock.x+2, rock.y+rock.r*0.5, rock.r*0.9, rock.r*0.3, 0, 0, Math.PI*2); ctx.fill();
    }
    // Деревья
    for (const tree of MAP_DECOR.trees) {
      ctx.fillStyle = '#00000040';
      ctx.beginPath(); ctx.ellipse(tree.x+4, tree.y+tree.r*0.6, tree.r*0.9, tree.r*0.35, 0, 0, Math.PI*2); ctx.fill();

      if (tree.variant === 0) {
        // Ель
        for (let tier = 0; tier < 3; tier++) {
          const tr = tree.r*(1-tier*0.25), ty = tree.y-tier*tree.r*0.5;
          ctx.fillStyle = tier===0?'#1a5228':tier===1?'#1e6030':'#2a7040';
          ctx.beginPath(); ctx.moveTo(tree.x,ty-tr); ctx.lineTo(tree.x+tr*0.8,ty+tr*0.5); ctx.lineTo(tree.x-tr*0.8,ty+tr*0.5); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = '#5a3820'; ctx.fillRect(tree.x-2, tree.y+tree.r*0.4, 4, tree.r*0.5);
      } else if (tree.variant === 1) {
        // Дуб
        ctx.fillStyle = '#5a3820'; ctx.fillRect(tree.x-3, tree.y, 6, tree.r*0.7);
        const cg = ctx.createRadialGradient(tree.x-tree.r*0.2, tree.y-tree.r*0.3, 0, tree.x, tree.y, tree.r);
        cg.addColorStop(0,'#5a8830'); cg.addColorStop(0.6,'#3a6820'); cg.addColorStop(1,'#2a4a18');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(tree.x, tree.y, tree.r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#7ab04044';
        ctx.beginPath(); ctx.arc(tree.x-tree.r*0.25, tree.y-tree.r*0.3, tree.r*0.45, 0, Math.PI*2); ctx.fill();
      } else {
        // Берёза
        ctx.fillStyle = '#e8e0d0'; ctx.fillRect(tree.x-2.5, tree.y-tree.r*0.3, 5, tree.r*1.1);
        ctx.fillStyle = '#33333366';
        for (let bi = 0; bi < 4; bi++) ctx.fillRect(tree.x-2, tree.y-tree.r*0.2+bi*tree.r*0.22, 4, 3);
        const bg = ctx.createRadialGradient(tree.x, tree.y-tree.r*0.5, 0, tree.x, tree.y-tree.r*0.5, tree.r*0.9);
        bg.addColorStop(0,'#90c07044'); bg.addColorStop(0.7,'#60a04060'); bg.addColorStop(1,'#408030aa');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.ellipse(tree.x, tree.y-tree.r*0.4, tree.r*0.8, tree.r*1.0, 0, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  function renderCapturePoints(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const cp of Object.values(s.capturePoints)) {
      const ownerColor = cp.ownerId ? s.players[cp.ownerId]?.color || '#888' : '#888';

      // Ореол
      const pg = ctx.createRadialGradient(cp.pos.x, cp.pos.y, 0, cp.pos.x, cp.pos.y, cp.radius);
      pg.addColorStop(0, (cp.ownerId?ownerColor:'#666')+'28');
      pg.addColorStop(0.7,(cp.ownerId?ownerColor:'#444')+'12');
      pg.addColorStop(1,'transparent');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(cp.pos.x, cp.pos.y, cp.radius, 0, Math.PI*2); ctx.fill();

      // Платформа
      ctx.fillStyle = '#2a2820';
      ctx.beginPath(); ctx.arc(cp.pos.x, cp.pos.y, 28, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = cp.ownerId ? ownerColor : '#665544'; ctx.lineWidth = 2;
      ctx.stroke();

      // Камни мощения
      ctx.strokeStyle = '#3a3830'; ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = (i/8)*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(cp.pos.x+10*Math.cos(a), cp.pos.y+10*Math.sin(a));
        ctx.lineTo(cp.pos.x+22*Math.cos(a), cp.pos.y+22*Math.sin(a)); ctx.stroke();
      }

      // Прогресс захвата
      if (cp.captureProgress > 0 && cp.captureProgress < 100) {
        const cc = cp.ownerId ? ownerColor : (cp.capturingPlayerId ? s.players[cp.capturingPlayerId]?.color||'#fff' : '#fff');
        ctx.save();
        ctx.strokeStyle = cc+'44'; ctx.lineWidth = 12; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cp.pos.x, cp.pos.y, cp.radius-5, -Math.PI/2, -Math.PI/2+(cp.captureProgress/100)*Math.PI*2); ctx.stroke();
        ctx.strokeStyle = cc; ctx.lineWidth = 4;
        ctx.stroke(); ctx.restore();
      }

      // Постройка
      ctx.save(); ctx.translate(cp.pos.x, cp.pos.y);
      if (cp.type==='castle') drawMiniCastle(ctx, ownerColor, cp.ownerId!==null);
      else if (cp.type==='mine') drawMiniMine(ctx, ownerColor, cp.ownerId!==null);
      else if (cp.type==='farm') drawMiniFarm(ctx, ownerColor, cp.ownerId!==null);
      else if (cp.type==='tower') drawMiniTower(ctx, ownerColor, cp.ownerId!==null);
      ctx.restore();

      // Название
      ctx.font = 'bold 10px Manrope, sans-serif'; ctx.fillStyle = cp.ownerId?'#fff':'#aaa';
      ctx.globalAlpha = 0.9; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(cp.label, cp.pos.x, cp.pos.y+32);
      if (cp.goldPerSec > 0 || cp.foodPerSec > 0) {
        ctx.font = '9px Manrope, sans-serif'; ctx.fillStyle = cp.ownerId?'#f0c060aa':'#66666655';
        ctx.fillText([cp.goldPerSec>0?`+${cp.goldPerSec}💰`:'',cp.foodPerSec>0?`+${cp.foodPerSec}🌾`:''].filter(Boolean).join(' '), cp.pos.x, cp.pos.y+44);
      }
      ctx.globalAlpha = 1;
    }
  }

  function renderUnits(ctx: CanvasRenderingContext2D, s: GameState, tick: number) {
    for (const unit of Object.values(s.units)) {
      if (unit.state === 'dead') continue;
      const isHuman = unit.ownerId === s.humanPlayerId;
      const ownerColor = s.players[unit.ownerId]?.color || '#aaa';
      const anim = (tick * 0.05 + unit.id.charCodeAt(1) * 0.1) % 1;

      // Тень
      ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(unit.pos.x+3, unit.pos.y+14, 11, 4, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Кольцо выделения для юнитов игрока
      if (isHuman) {
        ctx.save(); ctx.globalAlpha = 0.28 + Math.sin(tick*0.08)*0.12;
        ctx.strokeStyle = ownerColor; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(unit.pos.x, unit.pos.y, 20, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      }

      // Вычисляем направление взгляда
      let facing = 0;
      if (unit.state==='moving' && unit.targetPos) {
        facing = Math.atan2(unit.targetPos.y-unit.pos.y, unit.targetPos.x-unit.pos.x);
      } else if (unit.targetUnitId && s.units[unit.targetUnitId]) {
        facing = Math.atan2(s.units[unit.targetUnitId].pos.y-unit.pos.y, s.units[unit.targetUnitId].pos.x-unit.pos.x);
      }

      drawUnitSkin(ctx, unit.class, unit.pos.x, unit.pos.y, ownerColor, facing, isHuman, anim);

      // Вспышка атаки
      if (unit.state === 'attacking') {
        ctx.save(); ctx.globalAlpha = 0.2 + Math.sin(tick*0.3)*0.12;
        ctx.fillStyle = '#ffffffff';
        ctx.beginPath(); ctx.arc(unit.pos.x, unit.pos.y, 22, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }

      // HP-бар
      const hp = unit.hp / unit.maxHp;
      const bw = 28, bh = 4, bx = unit.pos.x-bw/2, by = unit.pos.y-26;
      ctx.fillStyle = '#111c'; ctx.fillRect(bx-1, by-1, bw+2, bh+2);
      ctx.fillStyle = hp>0.6?'#4caf50':hp>0.3?'#ff9800':'#f44336';
      ctx.fillRect(bx, by, bw*hp, bh);
    }
  }

  function renderCommanders(ctx: CanvasRenderingContext2D, s: GameState, tick: number) {
    for (const cmd of Object.values(s.commanders)) {
      if (!cmd.alive) continue;
      const player = s.players[cmd.ownerId];
      if (!player) continue;
      const isHuman = cmd.ownerId === s.humanPlayerId;
      const color = player.color;

      // Ореол базы
      const bg = ctx.createRadialGradient(cmd.pos.x, cmd.pos.y, 0, cmd.pos.x, cmd.pos.y, 26);
      bg.addColorStop(0, color+'2a'); bg.addColorStop(1, color+'00');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cmd.pos.x, cmd.pos.y, 26, 0, Math.PI*2); ctx.fill();

      // Пульсация своего
      if (isHuman) {
        ctx.save(); ctx.globalAlpha = 0.14 + Math.sin(tick*0.06)*0.08;
        ctx.strokeStyle = color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cmd.pos.x, cmd.pos.y, 28+Math.sin(tick*0.06)*3, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      }

      // Флаг
      ctx.strokeStyle = color; ctx.lineWidth = isHuman?2.5:2;
      ctx.beginPath(); ctx.moveTo(cmd.pos.x, cmd.pos.y+18); ctx.lineTo(cmd.pos.x, cmd.pos.y-28); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cmd.pos.x, cmd.pos.y-28);
      ctx.lineTo(cmd.pos.x+(isHuman?20:15), cmd.pos.y-21);
      ctx.lineTo(cmd.pos.x, cmd.pos.y-14);
      ctx.closePath(); ctx.fill();
      ctx.font = isHuman?'10px serif':'8px serif'; ctx.fillStyle = '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(isHuman?'♛':'⚔', cmd.pos.x+(isHuman?9:7), cmd.pos.y-21);

      // Тело
      const cg = ctx.createRadialGradient(cmd.pos.x-2, cmd.pos.y-2, 0, cmd.pos.x, cmd.pos.y, isHuman?14:11);
      cg.addColorStop(0,'#fff'); cg.addColorStop(1, color);
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cmd.pos.x, cmd.pos.y, isHuman?14:11, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = isHuman?'#fff':color+'aa'; ctx.lineWidth = isHuman?2.5:1.5; ctx.stroke();
      ctx.font = `${isHuman?14:11}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(isHuman?'👑':'⚔️', cmd.pos.x, cmd.pos.y);

      // HP-бар
      const hp = cmd.hp/cmd.maxHp;
      const bw = isHuman?36:28;
      ctx.fillStyle='#111c'; ctx.fillRect(cmd.pos.x-bw/2-1, cmd.pos.y+15, bw+2, 6);
      ctx.fillStyle=hp>0.6?'#4caf50':hp>0.3?'#ff9800':'#f44336';
      ctx.fillRect(cmd.pos.x-bw/2, cmd.pos.y+16, bw*hp, 4);

      // Имя (с тенью)
      const name = player.name.length>14?player.name.slice(0,14)+'…':player.name;
      ctx.font = `bold ${isHuman?11:9}px Manrope, sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillStyle='#000a'; ctx.fillText(name, cmd.pos.x+1, cmd.pos.y+23);
      ctx.fillStyle=isHuman?'#f0c060':color; ctx.fillText(name, cmd.pos.x, cmd.pos.y+22);
    }
  }

  function renderBuildings(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const bld of Object.values(s.buildings)) {
      const color = s.players[bld.ownerId]?.color || '#aaa';
      ctx.save(); ctx.translate(bld.pos.x, bld.pos.y);
      drawMiniTower(ctx, color, true);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(bld.pos.x, bld.pos.y, bld.range, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  // ── Обработчики мыши ────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX, py = (e.clientY - rect.top) * scaleY;
    const worldX = (px - canvas.width/2) / camera.zoom + camera.x;
    const worldY = (py - canvas.height/2) / camera.zoom + camera.y;
    onMapClick(worldX, worldY);
  }, [camera, onMapClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) { dragging.current = true; dragStart.current = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y }; }
  }, [camera]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const dx = (e.clientX-dragStart.current.x)/camera.zoom, dy = (e.clientY-dragStart.current.y)/camera.zoom;
    setCamera(prev => ({ ...prev, x: Math.max(0,Math.min(MAP_W,dragStart.current.cx-dx)), y: Math.max(0,Math.min(MAP_H,dragStart.current.cy-dy)) }));
  }, [camera.zoom, setCamera]);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setCamera(prev => ({ ...prev, zoom: Math.max(0.4, Math.min(2.5, prev.zoom - e.deltaY*0.001)) }));
  }, [setCamera]);

  return (
    <canvas
      ref={canvasRef}
      width={1200} height={800}
      style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={e => e.preventDefault()}
    />
  );
}
