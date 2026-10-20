'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

type Op = '+' | '-' | '×' | '÷';

function generateProblem(round: number): { question: string; answer: number } {
  const difficulty = Math.min(Math.floor(round / 5) + 1, 4);
  let a: number, b: number, op: Op, answer: number;

  if (difficulty <= 1) {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    op = Math.random() > 0.5 ? '+' : '-';
  } else if (difficulty === 2) {
    a = Math.floor(Math.random() * 50) + 1;
    b = Math.floor(Math.random() * 30) + 1;
    op = ['+', '-', '×'][Math.floor(Math.random() * 3)] as Op;
    if (op === '×') {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
    }
  } else {
    const ops: Op[] = ['+', '-', '×', '÷'];
    op = ops[Math.floor(Math.random() * 4)];
    if (op === '÷') {
      b = Math.floor(Math.random() * 12) + 2;
      answer = Math.floor(Math.random() * 12) + 1;
      a = b * answer;
      return { question: `${a} ${op} ${b}`, answer };
    }
    a = Math.floor(Math.random() * 100) + 1;
    b = Math.floor(Math.random() * 50) + 1;
    if (op === '×') {
      a = Math.floor(Math.random() * 15) + 1;
      b = Math.floor(Math.random() * 15) + 1;
    }
  }

  switch (op!) {
    case '+': answer = a + b; break;
    case '-': answer = a - b; break;
    case '×': answer = a * b; break;
    default: answer = a + b;
  }

  return { question: `${a} ${op!} ${b}`, answer };
}

export default function MathQuiz({ onGameOver, isPlaying }: Props) {
  const [problem, setProblem] = useState({ question: '', answer: 0 });
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const nextProblem = useCallback((r: number) => {
    setProblem(generateProblem(r));
    setInput('');
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    setScore(0);
    scoreRef.current = 0;
    setRound(0);
    setTimeLeft(60);
    setStreak(0);
    nextProblem(0);

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
  }, [isPlaying, onGameOver, nextProblem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(input, 10);
    if (isNaN(val)) return;

    if (val === problem.answer) {
      const streakBonus = Math.min(streak, 5) * 5;
      const pts = 20 + streakBonus;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setStreak((s) => s + 1);
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    const nextRound = round + 1;
    setRound(nextRound);

    setTimeout(() => nextProblem(nextRound), 400);
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
        <div className="text-sm">
          Streak: <span className="font-bold text-amber-500">🔥 {streak}</span>
        </div>
      </div>

      <div className={`rounded-2xl p-8 mb-6 transition-colors duration-300 ${
        feedback === 'correct'
          ? 'bg-green-50 dark:bg-green-900/20'
          : feedback === 'wrong'
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-gray-50 dark:bg-gray-800'
      }`}>
        <div className="text-sm text-gray-500 mb-2">Solve:</div>
        <div className="text-4xl sm:text-5xl font-bold font-mono mb-2">
          {problem.question} = ?
        </div>
        {feedback === 'correct' && (
          <div className="text-green-500 font-bold animate-pop">✓ Correct!</div>
        )}
        {feedback === 'wrong' && (
          <div className="text-red-500 font-bold animate-shake">
            ✗ Answer: {problem.answer}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field text-2xl text-center font-mono mb-3"
          placeholder="Your answer"
          autoComplete="off"
        />
        <button type="submit" className="btn-primary w-full">
          Submit
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        Round {round + 1} • Difficulty increases every 5 rounds
      </div>
    </div>
  );
}
