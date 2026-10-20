'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

const EMOJIS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎵', '🎸'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryMatch({ onGameOver, isPlaying }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    // Create shuffled pairs
    const pairs = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({
        id: i,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(pairs);
    setFlippedIds([]);
    setMatches(0);
    setMoves(0);
    setTimeLeft(60);
    setScore(0);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          onGameOver(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, score, onGameOver, timeLeft]);

  useEffect(() => {
    if (matches === EMOJIS.length && matches > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      const bonus = timeLeft * 10;
      const moveBonus = Math.max(0, (20 - moves) * 5);
      const finalScore = score + bonus + moveBonus;
      setScore(finalScore);
      setTimeout(() => onGameOver(finalScore), 500);
    }
  }, [matches]);

  const handleCardClick = (id: number) => {
    if (flippedIds.length >= 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c
    );
    setCards(newCards);
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      const c1 = newCards.find((c) => c.id === first)!;
      const c2 = newCards.find((c) => c.id === second)!;

      if (c1.emoji === c2.emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second
                ? { ...c, matched: true }
                : c
            )
          );
          setMatches((m) => m + 1);
          setScore((s) => s + 50);
          setFlippedIds([]);
        }, 300);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second
                ? { ...c, flipped: false }
                : c
            )
          );
          setFlippedIds([]);
        }, 800);
      }
    }
  };

  if (!isPlaying) return null;

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          Moves: <span className="font-bold">{moves}</span>
        </div>
        <div className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary-600 dark:text-primary-400'}`}>
          ⏱ {timeLeft}s
        </div>
        <div className="text-sm">
          Matched: <span className="font-bold">{matches}/{EMOJIS.length}</span>
        </div>
      </div>
      <div className="inline-grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300 transform ${
              card.flipped || card.matched
                ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-400 rotate-0 scale-100'
                : 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer'
            } ${card.matched ? 'opacity-60 scale-95' : ''}`}
            disabled={card.flipped || card.matched}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4">Score: {score}</p>
    </div>
  );
}
