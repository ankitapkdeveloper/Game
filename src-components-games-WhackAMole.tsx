'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

export default function WhackAMole({ onGameOver, isPlaying }: Props) {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hitAnim, setHitAnim] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moleRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const showMole = useCallback(() => {
    setMoles((prev) => {
      const next = Array(9).fill(false);
      const count = Math.random() > 0.7 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        let idx;
        do {
          idx = Math.floor(Math.random() * 9);
        } while (next[idx]);
        next[idx] = true;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setMoles(Array(9).fill(false));

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(moleRef.current!);
          setMoles(Array(9).fill(false));
          setTimeout(() => onGameOver(scoreRef.current), 200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    moleRef.current = setInterval(showMole, 800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleRef.current) clearInterval(moleRef.current);
    };
  }, [isPlaying, onGameOver, showMole]);

  const whack = (idx: number) => {
    if (!moles[idx]) return;
    setMoles((prev) => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });
    const pts = scoreRef.current + 10;
    scoreRef.current = pts;
    setScore(pts);
    setHitAnim(idx);
    setTimeout(() => setHitAnim(null), 300);
  };

  if (!isPlaying) return null;

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          Score: <span className="font-bold text-primary-600 dark:text-primary-400">{score}</span>
        </div>
        <div className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
          ⏱ {timeLeft}s
        </div>
      </div>
      <div className="inline-grid grid-cols-3 gap-3">
        {moles.map((active, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-150 border-2 ${
              active
                ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 scale-110 cursor-pointer animate-pop'
                : 'bg-green-900/20 dark:bg-green-900/10 border-green-800/30'
            } ${hitAnim === i ? 'animate-shake bg-red-200 dark:bg-red-900/30' : ''}`}
          >
            {active ? '🐹' : '🕳️'}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">Click the moles as fast as you can!</p>
    </div>
  );
}
