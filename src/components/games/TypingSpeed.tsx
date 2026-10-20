'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
  'code', 'game', 'arena', 'speed', 'type', 'fast', 'score', 'win',
  'play', 'best', 'time', 'race', 'fun', 'hero', 'star', 'goal',
  'fire', 'ice', 'wind', 'rock', 'wave', 'beam', 'glow', 'dash',
  'bolt', 'jump', 'flip', 'spin', 'rush', 'zoom', 'blitz', 'flash',
  'power', 'super', 'turbo', 'ultra', 'mega', 'hyper', 'swift', 'rapid',
  'keyboard', 'challenge', 'champion', 'victory', 'legend', 'master',
  'dragon', 'phoenix', 'thunder', 'crystal', 'shadow', 'silver',
];

export default function TypingSpeed({ onGameOver, isPlaying }: Props) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateWords = useCallback(() => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 40);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    setWords(generateWords());
    setCurrentIndex(0);
    setInput('');
    setTimeLeft(60);
    setCorrect(0);
    setWrong(0);
    setTotalChars(0);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    setTimeout(() => inputRef.current?.focus(), 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, generateWords]);

  useEffect(() => {
    if (timeLeft === 0 && isPlaying) {
      const wpm = Math.round((correct / 60) * 60);
      const accuracy = totalChars > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
      const score = wpm * 10 + accuracy * 2;
      onGameOver(score);
    }
  }, [timeLeft, isPlaying, correct, wrong, totalChars, onGameOver]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (val.endsWith(' ')) {
      const typed = val.trim();
      setTotalChars((c) => c + typed.length);

      if (typed === words[currentIndex]) {
        setCorrect((c) => c + 1);
      } else {
        setWrong((w) => w + 1);
      }

      setCurrentIndex((i) => i + 1);
      setInput('');

      if (currentIndex >= words.length - 1) {
        setWords((prev) => [...prev, ...generateWords()]);
      }
    } else {
      setInput(val);
    }
  };

  if (!isPlaying) return null;

  const wpm = timeLeft < 60 ? Math.round((correct / (60 - timeLeft)) * 60) : 0;

  return (
    <div className="py-4 px-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          WPM: <span className="font-bold text-primary-600 dark:text-primary-400">{wpm}</span>
        </div>
        <div className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}`}>
          ⏱ {timeLeft}s
        </div>
        <div className="text-sm">
          <span className="text-green-500">{correct}✓</span>{' '}
          <span className="text-red-500">{wrong}✗</span>
        </div>
      </div>

      {/* Word display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 min-h-[100px] flex flex-wrap gap-2 items-start">
        {words.slice(Math.max(0, currentIndex - 5), currentIndex + 20).map((word, i) => {
          const actualIndex = Math.max(0, currentIndex - 5) + i;
          return (
            <span
              key={actualIndex}
              className={`text-lg font-mono px-1 py-0.5 rounded transition-all ${
                actualIndex === currentIndex
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold border-b-2 border-primary-500'
                  : actualIndex < currentIndex
                  ? 'text-gray-400 dark:text-gray-600 line-through'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInput}
        className="input-field text-lg font-mono text-center"
        placeholder="Type the highlighted word and press space..."
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
        <span>Words: {correct + wrong}</span>
        <span>Accuracy: {correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 100}%</span>
      </div>
    </div>
  );
}
