'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

const ROWS = 9;
const COLS = 9;
const MINES = 10;

function createBoard(): Cell[][] {
  const board: Cell[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

  // Place mines
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // Calculate adjacents
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
            count++;
          }
        }
      }
      board[r][c].adjacent = count;
    }
  }

  return board;
}

export default function Minesweeper({ onGameOver, isPlaying }: Props) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [flagsLeft, setFlagsLeft] = useState(MINES);

  useEffect(() => {
    if (!isPlaying) return;
    setBoard(createBoard());
    setGameState('playing');
    setTimeElapsed(0);
    setFlagsLeft(MINES);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameState !== 'playing') return;
    const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, gameState]);

  const reveal = useCallback(
    (board: Cell[][], r: number, c: number): Cell[][] => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return board;
      if (board[r][c].revealed || board[r][c].flagged) return board;

      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
      newBoard[r][c].revealed = true;

      if (newBoard[r][c].adjacent === 0 && !newBoard[r][c].mine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const result = reveal(newBoard, r + dr, c + dc);
            for (let i = 0; i < ROWS; i++) {
              for (let j = 0; j < COLS; j++) {
                newBoard[i][j] = result[i][j];
              }
            }
          }
        }
      }

      return newBoard;
    },
    []
  );

  const checkWin = useCallback((b: Cell[][]) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!b[r][c].mine && !b[r][c].revealed) return false;
      }
    }
    return true;
  }, []);

  const handleClick = (r: number, c: number) => {
    if (gameState !== 'playing') return;
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    if (cell.mine) {
      // Reveal all mines
      const newBoard = board.map((row) =>
        row.map((cell) => ({
          ...cell,
          revealed: cell.mine ? true : cell.revealed,
        }))
      );
      setBoard(newBoard);
      setGameState('lost');
      setTimeout(() => onGameOver(0), 1500);
      return;
    }

    const newBoard = reveal(board, r, c);
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setGameState('won');
      const timeBonus = Math.max(0, 300 - timeElapsed * 2);
      const score = 500 + timeBonus;
      setTimeout(() => onGameOver(score), 1000);
    }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    const cell = board[r][c];
    if (cell.revealed) return;

    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;
    setBoard(newBoard);
    setFlagsLeft((f) => (newBoard[r][c].flagged ? f - 1 : f + 1));
  };

  if (!isPlaying || board.length === 0) return null;

  const adjColors: Record<number, string> = {
    1: 'text-blue-500',
    2: 'text-green-500',
    3: 'text-red-500',
    4: 'text-purple-700',
    5: 'text-amber-800',
    6: 'text-teal-500',
    7: 'text-black dark:text-white',
    8: 'text-gray-500',
  };

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          🚩 <span className="font-bold">{flagsLeft}</span>
        </div>
        <div className="text-sm">
          {gameState === 'won' && <span className="text-green-500 font-bold">🎉 You Won!</span>}
          {gameState === 'lost' && <span className="text-red-500 font-bold">💥 Game Over</span>}
          {gameState === 'playing' && <span className="font-bold">😊</span>}
        </div>
        <div className="text-sm font-bold">⏱ {timeElapsed}s</div>
      </div>

      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-bold flex items-center justify-center rounded transition-all duration-100 ${
                cell.revealed
                  ? cell.mine
                    ? 'bg-red-200 dark:bg-red-900/40'
                    : 'bg-gray-100 dark:bg-gray-700'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer shadow-sm active:shadow-none active:scale-95'
              }`}
            >
              {cell.revealed
                ? cell.mine
                  ? '💣'
                  : cell.adjacent > 0
                  ? <span className={adjColors[cell.adjacent]}>{cell.adjacent}</span>
                  : ''
                : cell.flagged
                ? '🚩'
                : ''}
            </button>
          ))
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Left-click to reveal • Right-click to flag
      </p>
    </div>
  );
}
