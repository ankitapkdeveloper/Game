'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

const SIZE = 4;

function createSolved(): number[] {
  const tiles: number[] = [];
  for (let i = 1; i < SIZE * SIZE; i++) tiles.push(i);
  tiles.push(0);
  return tiles;
}

function isSolvable(tiles: number[]): boolean {
  let inversions = 0;
  const filtered = tiles.filter((t) => t !== 0);
  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) inversions++;
    }
  }
  const emptyRow = Math.floor(tiles.indexOf(0) / SIZE);
  if (SIZE % 2 === 1) return inversions % 2 === 0;
  return (inversions + emptyRow) % 2 === 1;
}

function shuffle(): number[] {
  let tiles: number[];
  do {
    tiles = createSolved().sort(() => Math.random() - 0.5);
  } while (!isSolvable(tiles) || isSolvedCheck(tiles));
  return tiles;
}

function isSolvedCheck(tiles: number[]): boolean {
  const solved = createSolved();
  return tiles.every((t, i) => t === solved[i]);
}

export default function PuzzleSlider({ onGameOver, isPlaying }: Props) {
  const [tiles, setTiles] = useState<number[]>(createSolved());
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    setTiles(shuffle());
    setMoves(0);
    setTimeElapsed(0);
    setSolved(false);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || solved) return;
    const timer = setInterval(() => {
      setTimeElapsed((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, solved]);

  const handleTileClick = useCallback(
    (index: number) => {
      if (solved) return;
      const emptyIdx = tiles.indexOf(0);
      const row = Math.floor(index / SIZE);
      const col = index % SIZE;
      const emptyRow = Math.floor(emptyIdx / SIZE);
      const emptyCol = emptyIdx % SIZE;

      const isAdjacent =
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow);

      if (!isAdjacent) return;

      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
      setTiles(newTiles);
      setMoves((m) => m + 1);

      if (isSolvedCheck(newTiles)) {
        setSolved(true);
        // Score: fewer moves & less time = higher score
        const moveScore = Math.max(0, 1000 - moves * 5);
        const timeScore = Math.max(0, 500 - timeElapsed * 2);
        const finalScore = moveScore + timeScore;
        setTimeout(() => onGameOver(finalScore), 1000);
      }
    },
    [tiles, solved, moves, timeElapsed, onGameOver]
  );

  if (!isPlaying) return null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          Moves: <span className="font-bold">{moves}</span>
        </div>
        <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
          ⏱ {formatTime(timeElapsed)}
        </div>
      </div>

      {solved && (
        <div className="mb-4 text-green-500 font-bold text-xl animate-pop">
          🎉 Puzzle Solved!
        </div>
      )}

      <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {tiles.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(i)}
            disabled={tile === 0 || solved}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-xl sm:text-2xl font-bold flex items-center justify-center transition-all duration-150 ${
              tile === 0
                ? 'bg-transparent'
                : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer'
            } ${solved && tile !== 0 ? 'from-green-500 to-green-700' : ''}`}
          >
            {tile !== 0 ? tile : ''}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Click tiles adjacent to the empty space to slide them
      </p>
    </div>
  );
}
