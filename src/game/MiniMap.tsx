import { useRef, useEffect } from 'react';
import { GameState } from './types';
import { MAP_W, MAP_H } from './engine';

interface Props {
  state: GameState;
  camera: { x: number; y: number; zoom: number };
  onMiniClick: (worldX: number, worldY: number) => void;
  viewW: number;
  viewH: number;
}

const MM_W = 160;
const MM_H = 120;

export default function MiniMap({ state, camera, onMiniClick, viewW, viewH }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, MM_W, MM_H);

    // Фон
    ctx.fillStyle = '#0d1a0d';
    ctx.fillRect(0, 0, MM_W, MM_H);

    const sx = MM_W / MAP_W;
    const sy = MM_H / MAP_H;

    // Точки захвата
    for (const cp of Object.values(state.capturePoints)) {
      ctx.fillStyle = cp.ownerId ? (state.players[cp.ownerId]?.color || '#888') : '#555';
      ctx.beginPath();
      ctx.arc(cp.pos.x * sx, cp.pos.y * sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Строения
    for (const bld of Object.values(state.buildings)) {
      const col = state.players[bld.ownerId]?.color || '#aaa';
      ctx.fillStyle = col;
      ctx.fillRect(bld.pos.x * sx - 2, bld.pos.y * sy - 2, 4, 4);
    }

    // Юниты
    for (const unit of Object.values(state.units)) {
      if (unit.state === 'dead') continue;
      ctx.fillStyle = state.players[unit.ownerId]?.color || '#aaa';
      ctx.beginPath();
      ctx.arc(unit.pos.x * sx, unit.pos.y * sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Командиры
    for (const cmd of Object.values(state.commanders)) {
      if (!cmd.alive) continue;
      const color = state.players[cmd.ownerId]?.color || '#aaa';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cmd.pos.x * sx, cmd.pos.y * sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Viewport прямоугольник
    const vpX = (camera.x - (viewW / 2) / camera.zoom) * sx;
    const vpY = (camera.y - (viewH / 2) / camera.zoom) * sy;
    const vpW = (viewW / camera.zoom) * sx;
    const vpH = (viewH / camera.zoom) * sy;

    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    // Граница
    ctx.strokeStyle = '#c9a84c88';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.5, 0.5, MM_W - 1, MM_H - 1);
  });

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    onMiniClick((px / MM_W) * MAP_W, (py / MM_H) * MAP_H);
  };

  return (
    <canvas
      ref={canvasRef}
      width={MM_W}
      height={MM_H}
      style={{ width: MM_W, height: MM_H, cursor: 'pointer', borderRadius: 4 }}
      onClick={handleClick}
    />
  );
}
