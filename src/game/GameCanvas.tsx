import { useRef, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { MAP_W, MAP_H } from './engine';

interface Props {
  state: GameState;
  onMapClick: (x: number, y: number) => void;
  camera: { x: number; y: number; zoom: number };
  setCamera: (fn: (prev: { x: number; y: number; zoom: number }) => { x: number; y: number; zoom: number }) => void;
}

export default function GameCanvas({ state, onMapClick, camera, setCamera }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  // Рисуем каждый раз при изменении state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-camera.x * camera.zoom + W / 2, -camera.y * camera.zoom + H / 2);
    ctx.scale(camera.zoom, camera.zoom);

    drawMap(ctx, state);
    drawBuildings(ctx, state);
    drawCapturePoints(ctx, state);
    drawUnits(ctx, state);
    drawCommanders(ctx, state);

    ctx.restore();
  });

  function drawMap(ctx: CanvasRenderingContext2D, s: GameState) {
    // Фон — трава
    const grad = ctx.createLinearGradient(0, 0, MAP_W, MAP_H);
    grad.addColorStop(0, '#1a2e1a');
    grad.addColorStop(0.5, '#1e3320');
    grad.addColorStop(1, '#152815');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // Сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= MAP_W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP_H); ctx.stroke();
    }
    for (let y = 0; y <= MAP_H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP_W, y); ctx.stroke();
    }

    // Граница карты
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, MAP_W - 4, MAP_H - 4);

    // Декоративные угловые орнаменты
    for (const [cx, cy] of [[0, 0], [MAP_W, 0], [0, MAP_H], [MAP_W, MAP_H]] as [number, number][]) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = '#c9a84c88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawCapturePoints(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const cp of Object.values(s.capturePoints)) {
      // Зона захвата
      const ownerColor = cp.ownerId ? s.players[cp.ownerId]?.color || '#888' : '#888';
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = cp.ownerId ? ownerColor : '#888';
      ctx.beginPath();
      ctx.arc(cp.pos.x, cp.pos.y, cp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Кольцо
      ctx.strokeStyle = cp.ownerId ? ownerColor : '#888888aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cp.pos.x, cp.pos.y, cp.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Прогресс захвата
      if (cp.capturingPlayerId && cp.ownerId === null) {
        const captColor = s.players[cp.capturingPlayerId]?.color || '#fff';
        ctx.strokeStyle = captColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cp.pos.x, cp.pos.y, cp.radius - 4, -Math.PI / 2, -Math.PI / 2 + (cp.captureProgress / 100) * Math.PI * 2);
        ctx.stroke();
      }

      // Иконка
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cp.emoji, cp.pos.x, cp.pos.y - 2);

      // Название
      ctx.font = 'bold 10px Manrope, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.8;
      ctx.fillText(cp.label, cp.pos.x, cp.pos.y + 20);
      ctx.globalAlpha = 1;
    }
  }

  function drawUnits(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const unit of Object.values(s.units)) {
      if (unit.state === 'dead') continue;

      const isHuman = unit.ownerId === s.humanPlayerId;
      const color = s.players[unit.ownerId]?.color || '#aaa';

      // Тень
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(unit.pos.x, unit.pos.y + 10, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Круг юнита
      ctx.beginPath();
      ctx.arc(unit.pos.x, unit.pos.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = color + '33';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = isHuman ? 2.5 : 1.5;
      ctx.stroke();

      // Эмодзи
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(unit.emoji, unit.pos.x, unit.pos.y);

      // HP-бар
      const hpRatio = unit.hp / unit.maxHp;
      const bw = 24, bh = 3;
      ctx.fillStyle = '#222';
      ctx.fillRect(unit.pos.x - bw / 2, unit.pos.y - 22, bw, bh);
      ctx.fillStyle = hpRatio > 0.5 ? '#4caf50' : hpRatio > 0.25 ? '#ff9800' : '#f44336';
      ctx.fillRect(unit.pos.x - bw / 2, unit.pos.y - 22, bw * hpRatio, bh);

      // Атака — вспышка
      if (unit.state === 'attacking') {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(unit.pos.x, unit.pos.y, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawCommanders(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const cmd of Object.values(s.commanders)) {
      if (!cmd.alive) continue;
      const player = s.players[cmd.ownerId];
      if (!player) continue;
      const isHuman = cmd.ownerId === s.humanPlayerId;
      const color = player.color;

      // Флаг-шест
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cmd.pos.x, cmd.pos.y + 20);
      ctx.lineTo(cmd.pos.x, cmd.pos.y - 30);
      ctx.stroke();

      // Флажок
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cmd.pos.x, cmd.pos.y - 30);
      ctx.lineTo(cmd.pos.x + 18, cmd.pos.y - 22);
      ctx.lineTo(cmd.pos.x, cmd.pos.y - 14);
      ctx.closePath();
      ctx.fill();

      // Кружок командира
      ctx.beginPath();
      ctx.arc(cmd.pos.x, cmd.pos.y, isHuman ? 12 : 10, 0, Math.PI * 2);
      ctx.fillStyle = color + '55';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = isHuman ? 3 : 2;
      ctx.stroke();

      // Иконка
      ctx.font = isHuman ? '13px serif' : '11px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isHuman ? '👑' : '⚔️', cmd.pos.x, cmd.pos.y);

      // HP бар командира
      const hpR = cmd.hp / cmd.maxHp;
      const bw = 30;
      ctx.fillStyle = '#222';
      ctx.fillRect(cmd.pos.x - bw / 2, cmd.pos.y + 16, bw, 4);
      ctx.fillStyle = hpR > 0.5 ? '#4caf50' : '#f44336';
      ctx.fillRect(cmd.pos.x - bw / 2, cmd.pos.y + 16, bw * hpR, 4);

      // Имя
      ctx.font = `bold ${isHuman ? 11 : 9}px Manrope, sans-serif`;
      ctx.fillStyle = isHuman ? '#f0c060' : '#ddd';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(player.name.length > 14 ? player.name.slice(0, 14) + '…' : player.name, cmd.pos.x, cmd.pos.y + 22);
    }
  }

  function drawBuildings(ctx: CanvasRenderingContext2D, s: GameState) {
    for (const bld of Object.values(s.buildings)) {
      const color = s.players[bld.ownerId]?.color || '#aaa';
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bld.emoji, bld.pos.x, bld.pos.y);

      // Радиус атаки (тонко)
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bld.pos.x, bld.pos.y, bld.range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Клик мышью
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const W = canvas.width, H = canvas.height;
    const worldX = (px - W / 2) / camera.zoom + camera.x;
    const worldY = (py - H / 2) / camera.zoom + camera.y;
    onMapClick(worldX, worldY);
  }, [camera, onMapClick]);

  // Перетаскивание
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y };
    }
  }, [camera]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const dx = (e.clientX - dragStart.current.x) / camera.zoom;
    const dy = (e.clientY - dragStart.current.y) / camera.zoom;
    setCamera(prev => ({
      ...prev,
      x: Math.max(0, Math.min(MAP_W, dragStart.current.cx - dx)),
      y: Math.max(0, Math.min(MAP_H, dragStart.current.cy - dy)),
    }));
  }, [camera.zoom, setCamera]);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.4, Math.min(2.5, prev.zoom - e.deltaY * 0.001)),
    }));
  }, [setCamera]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={600}
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
