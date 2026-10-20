'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Point = { x: number; y: number };

const GRID = 20;
const CELL = 20;

export default function Snake({ onGameOver, isPlaying }: Props) {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const dirRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const spawnFood = useCallback((s: Point[]): Point => {
    let f: Point;
    do {
      f = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
    } while (s.some((p) => p.x === f.x && p.y === f.y));
    return f;
  }, []);

  const gameLoop = useCallback(() => {
    setSnake((prev) => {
      const head = { ...prev[0] };
      const dir = dirRef.current;

      if (dir === 'UP') head.y -= 1;
      if (dir === 'DOWN') head.y += 1;
      if (dir === 'LEFT') head.x -= 1;
      if (dir === 'RIGHT') head.x += 1;

      // Wall collision
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        setTimeout(() => onGameOver(score), 100);
        return prev;
      }

      // Self collision
      if (prev.some((p) => p.x === head.x && p.y === head.y)) {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        setTimeout(() => onGameOver(score), 100);
        return prev;
      }

      const newSnake = [head, ...prev];

      // Eat food
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        setFood(spawnFood(newSnake));
        if (newScore % 50 === 0) {
          setSpeed((s) => Math.max(60, s - 10));
        }
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [food, score, onGameOver, spawnFood]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    // Grid lines
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    // Snake
    snake.forEach((p, i) => {
      const grad = ctx.createRadialGradient(
        p.x * CELL + CELL / 2, p.y * CELL + CELL / 2, 2,
        p.x * CELL + CELL / 2, p.y * CELL + CELL / 2, CELL / 2
      );
      if (i === 0) {
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(1, '#4f46e5');
      } else {
        grad.addColorStop(0, '#818cf8');
        grad.addColorStop(1, '#6366f1');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });

    // Food
    ctx.fillStyle = '#e94560';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6b81';
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2 - 2, food.y * CELL + CELL / 2 - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [snake, food]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;
    gameLoopRef.current = setInterval(gameLoop, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameLoop, speed]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
        W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
      };
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opp: Record<Direction, Direction> = {
        UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
      };
      if (newDir !== opp[dirRef.current]) {
        dirRef.current = newDir;
        setDirection(newDir);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!isPlaying) return null;

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          Length: <span className="font-bold">{snake.length}</span>
        </div>
        <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
          Score: {score}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={GRID * CELL}
        height={GRID * CELL}
        className="mx-auto rounded-xl border-2 border-gray-700"
      />
      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 max-w-[180px] mx-auto md:hidden">
        <div />
        <button onClick={() => { if (dirRef.current !== 'DOWN') { dirRef.current = 'UP'; setDirection('UP'); } }} className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">↑</button>
        <div />
        <button onClick={() => { if (dirRef.current !== 'RIGHT') { dirRef.current = 'LEFT'; setDirection('LEFT'); } }} className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">←</button>
        <button onClick={() => { if (dirRef.current !== 'UP') { dirRef.current = 'DOWN'; setDirection('DOWN'); } }} className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">↓</button>
        <button onClick={() => { if (dirRef.current !== 'LEFT') { dirRef.current = 'RIGHT'; setDirection('RIGHT'); } }} className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 font-bold">→</button>
      </div>
      <p className="text-xs text-gray-500 mt-2 hidden md:block">
        Use arrow keys or WASD to move
      </p>
    </div>
  );
}
