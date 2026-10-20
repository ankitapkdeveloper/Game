'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
];

export default function ColorMatch({ onGameOver, isPlaying }: Props) {
  const [displayWord, setDisplayWord] = useState('');
  const [displayColor, setDisplayColor] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [round, setRound] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const newRound = useCallback(() => {
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setDisplayWord(wordColor.name);
    setDisplayColor(textColor.hex);
    setCorrectAnswer(textColor.name);

    // Generate options (always include correct)
    const opts = new Set<string>([textColor.name]);
    while (opts.size < 3) {
      opts.add(COLORS[Math.floor(Math.random() * COLORS.length)].name);
    }
    setOptions([...opts].sort(() => Math.random() - 0.5));
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setStreak(0);
    setRound(0);
    newRound();

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimeout(() => onGameOver(scoreRef.current), 200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, onGameOver, newRound]);

  const handleAnswer = (answer: string) => {
    if (feedback) return;

    if (answer === correctAnswer) {
      const bonus = Math.min(streak, 10) * 5;
      const pts = 25 + bonus;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setStreak((s) => s + 1);
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }
    setRound((r) => r + 1);
    setTimeout(() => newRound(), 400);
  };

  if (!isPlaying) return null;

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          Score: <span className="font-bold text-primary-600 dark:text-primary-400">{scoreRef.current}</span>
        </div>
        <div className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
          ⏱ {timeLeft}s
        </div>
        <div className="text-sm">
          Streak: <span className="font-bold text-amber-500">🔥 {streak}</span>
        </div>
      </div>

      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        What COLOR is the text displayed in?
      </div>

      <div className={`rounded-2xl p-8 mb-6 transition-colors duration-200 ${
        feedback === 'correct'
          ? 'bg-green-50 dark:bg-green-900/20'
          : feedback === 'wrong'
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-gray-50 dark:bg-gray-800'
      }`}>
        <div
          className="text-5xl sm:text-6xl font-extrabold mb-4 select-none"
          style={{ color: displayColor }}
        >
          {displayWord}
        </div>
        {feedback === 'correct' && (
          <div className="text-green-500 font-bold animate-pop">✓ Correct!</div>
        )}
        {feedback === 'wrong' && (
          <div className="text-red-500 font-bold animate-shake">
            ✗ It was {correctAnswer}
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {options.map((opt) => {
          const color = COLORS.find((c) => c.name === opt);
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: color?.hex }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Round {round + 1} • Don&apos;t read the word — look at the color!
      </div>
    </div>
  );
}
