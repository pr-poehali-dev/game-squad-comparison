import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState, UnitClass,
} from './types';
import {
  createInitialState, tick,
  playerMoveUnits, playerRecruitUnit, playerBuildTower,
} from './engine';

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);

  const loop = useCallback((now: number) => {
    if (!runningRef.current) return;
    const dt = Math.min(now - lastTimeRef.current, 100); // cap at 100ms
    lastTimeRef.current = now;

    if (stateRef.current && stateRef.current.phase === 'playing') {
      const next = tick(stateRef.current, dt);
      stateRef.current = next;
      setState(next);
    }

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const startGame = useCallback((playerName: string, botCount: number) => {
    const initial = createInitialState(playerName, botCount);
    stateRef.current = initial;
    setState(initial);
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stopGame = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => () => stopGame(), [stopGame]);

  const moveUnits = useCallback((x: number, y: number) => {
    if (!stateRef.current) return;
    const next = playerMoveUnits(stateRef.current, x, y);
    stateRef.current = next;
    setState(next);
  }, []);

  const recruitUnit = useCallback((cls: UnitClass) => {
    if (!stateRef.current) return;
    const next = playerRecruitUnit(stateRef.current, cls);
    stateRef.current = next;
    setState(next);
  }, []);

  const buildTower = useCallback(() => {
    if (!stateRef.current) return;
    const next = playerBuildTower(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

  const restartGame = useCallback((playerName: string, botCount: number) => {
    stopGame();
    setTimeout(() => startGame(playerName, botCount), 50);
  }, [stopGame, startGame]);

  return { state, startGame, stopGame, restartGame, moveUnits, recruitUnit, buildTower };
}
