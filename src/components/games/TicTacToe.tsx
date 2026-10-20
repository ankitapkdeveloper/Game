'use client';

import React, { useState, useCallback } from 'react';

interface Props {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

type Cell = 'X' | 'O' | null;

export default function TicTacToe({ onGameOver, isPlaying }: Props) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [playerTurn, setPlayerTurn] = useState(true);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('Your turn! (X)');

  const checkWinner = useCallback((b: Cell[]): Cell => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, c, d] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return null;
  }, []);

  const aiMove = useCallback(
    (b: Cell[]) => {
      // Simple AI: try to win, block, or pick random
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      const empty = b.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
      if (empty.length === 0) return b;

      // Try to win
      for (const idx of empty) {
        const test = [...b];
        test[idx] = 'O';
        if (checkWinner(test) === 'O') {
          test[idx] = 'O';
          return test;
        }
      }
      // Try to block
      for (const idx of empty) {
        const test = [...b];
        test[idx] = 'X';
        if (checkWinner(test) === 'X') {
          const newB = [...b];
          newB[idx] = 'O';
          return newB;
        }
      }
      // Take center
      if (b[4] === null) {
        const newB = [...b];
        newB[4] = 'O';
        return newB;
      }
      // Random
      const pick = empty[Math.floor(Math.random() * empty.length)];
      const newB = [...b];
      newB[pick] = 'O';
      return newB;
    },
    [checkWinner]
  );

  const handleClick = (idx: number) => {
    if (!isPlaying || !playerTurn || board[idx]) return;

    const newBoard = [...board];
    newBoard[idx] = 'X';

    const winner = checkWinner(newBoard);
    if (winner === 'X') {
      setBoard(newBoard);
      const pts = score + 100;
      setScore(pts);
      setMessage('You win this round! 🎉');
      setTimeout(() => {
        if (round >= 5) {
          onGameOver(pts);
        } else {
          setBoard(Array(9).fill(null));
          setRound((r) => r + 1);
          setPlayerTurn(true);
          setMessage('Your turn! (X)');
        }
      }, 1500);
      return;
    }

    if (newBoard.every((c) => c !== null)) {
      setBoard(newBoard);
      const pts = score + 25;
      setScore(pts);
      setMessage("It's a draw!");
      setTimeout(() => {
        if (round >= 5) {
          onGameOver(pts);
        } else {
          setBoard(Array(9).fill(null));
          setRound((r) => r + 1);
          setPlayerTurn(true);
          setMessage('Your turn! (X)');
        }
      }, 1500);
      return;
    }

    setBoard(newBoard);
    setPlayerTurn(false);
    setMessage('AI thinking...');

    setTimeout(() => {
      const afterAi = aiMove(newBoard);
      setBoard(afterAi);

      const aiWin = checkWinner(afterAi);
      if (aiWin === 'O') {
        setMessage('AI wins this round 😔');
        setTimeout(() => {
          if (round >= 5) {
            onGameOver(score);
          } else {
            setBoard(Array(9).fill(null));
            setRound((r) => r + 1);
            setPlayerTurn(true);
            setMessage('Your turn! (X)');
          }
        }, 1500);
        return;
      }

      if (afterAi.every((c) => c !== null)) {
        const pts = score + 25;
        setScore(pts);
        setMessage("It's a draw!");
        setTimeout(() => {
          if (round >= 5) {
            onGameOver(pts);
          } else {
            setBoard(Array(9).fill(null));
            setRound((r) => r + 1);
            setPlayerTurn(true);
            setMessage('Your turn! (X)');
          }
        }, 1500);
        return;
      }

      setPlayerTurn(true);
      setMessage('Your turn! (X)');
    }, 500);
  };

  if (!isPlaying) return null;

  return (
    <div className="text-center py-4">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="text-sm">
          Round <span className="font-bold">{round}/5</span>
        </div>
        <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
          {message}
        </div>
        <div className="text-sm">
          Score: <span className="font-bold">{score}</span>
        </div>
      </div>
      <div className="inline-grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-20 h-20 rounded-xl text-3xl font-bold flex items-center justify-center transition-all duration-200 ${
              cell
                ? 'bg-gray-100 dark:bg-gray-700'
                : 'bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'
            } border-2 ${
              cell === 'X'
                ? 'border-primary-500 text-primary-600'
                : cell === 'O'
                ? 'border-arena-accent text-arena-accent'
                : 'border-gray-200 dark:border-gray-600'
            }`}
            disabled={!playerTurn || !!cell}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}
