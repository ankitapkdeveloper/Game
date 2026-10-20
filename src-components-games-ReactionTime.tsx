'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

type Phase = 'waiting' | 'ready' | 'go' | 'result' | 'too-early';

export default function ReactionTime({ onGameOver, isPlaying }: Props) {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [times, setTimes] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const startRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const totalRounds = 5;

  useEffect(() => {
    if (!isPlaying) return;
    setTimes([]);
    setRound(0);
    setPhase('waiting');
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying]);

  const startRound = () => {
    setPhase('ready');
    const delay = 1000 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => {
      setPhase('go');
      startRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (phase === 'waiting') {
      startRound();
    } else if (phase === 'ready') {
      // Clicked too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase('too-early');
    } else if (phase === 'go') {
      const reaction = Date.now() - startRef.current;
      setCurrentTime(reaction);
      const newTimes = [...times, reaction];
      setTimes(newTimes);
      setPhase('result');

      if (round + 1 >= totalRounds) {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        // Score: faster = higher (max ~1000 for <150ms avg)
        const score = Math.max(0, Math.round(1000 - avg * 2));
        setTimeout(() => onGameOver(score), 1500);
      }
    } else if (phase === 'result' || phase === 'too-early') {
      setRound((r) => r + 1);
      startRound();
    }
  };

  if (!isPlaying) return null;

  const avg =
    times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          Round: <span className="font-bold">{Math.min(round + 1, totalRounds)}/{totalRounds}</span>
        </div>
        <div className="text-sm">
          Avg: <span className="font-bold text-primary-600 dark:text-primary-400">{avg}ms</span>
        </div>
      </div>

      <button
        onClick={handleClick}
        className={`w-full rounded-2xl p-12 sm:p-16 transition-all duration-200 cursor-pointer select-none ${
          phase === 'waiting'
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : phase === 'ready'
            ? 'bg-red-500 text-white'
            : phase === 'go'
            ? 'bg-green-500 text-white animate-pulse'
            : phase === 'too-early'
            ? 'bg-yellow-500 text-black'
            : 'bg-blue-500 text-white'
        }`}
      >
        {phase === 'waiting' && (
          <div>
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-xl font-bold">Click to Start</div>
            <div className="text-sm opacity-80 mt-2">
              Test your reaction time!
            </div>
          </div>
        )}
        {phase === 'ready' && (
          <div>
            <div className="text-4xl mb-4">🔴</div>
            <div className="text-xl font-bold">Wait for green...</div>
            <div className="text-sm opacity-80 mt-2">Don&apos;t click yet!</div>
          </div>
        )}
        {phase === 'go' && (
          <div>
            <div className="text-4xl mb-4">🟢</div>
            <div className="text-xl font-bold">CLICK NOW!</div>
          </div>
        )}
        {phase === 'too-early' && (
          <div>
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-xl font-bold">Too Early!</div>
            <div className="text-sm mt-2">Click to try again</div>
          </div>
        )}
        {phase === 'result' && (
          <div>
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-5xl font-extrabold mb-2">{currentTime}ms</div>
            <div className="text-sm opacity-80">
              {currentTime < 200
                ? '🔥 Lightning fast!'
                : currentTime < 300
                ? '⚡ Great reflexes!'
                : currentTime < 400
                ? '👍 Good job!'
                : '🐌 Keep practicing!'}
            </div>
            {round + 1 < totalRounds && (
              <div className="text-sm mt-2">Click for next round</div>
            )}
          </div>
        )}
      </button>

      {/* Results history */}
      {times.length > 0 && (
        <div className="flex justify-center gap-3 mt-4">
          {times.map((t, i) => (
            <div
              key={i}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                t < 250
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : t < 400
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              {t}ms
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
