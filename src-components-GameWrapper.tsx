'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getGameById } from '@/lib/games';
import { submitScore, getUserBestScore, getTopScores } from '@/lib/scores';
import { ArrowLeft, Trophy, Star, RotateCcw } from 'lucide-react';

interface GameWrapperProps {
  gameId: string;
  children: (props: {
    onGameOver: (score: number) => void;
    isPlaying: boolean;
    startGame: () => void;
  }) => React.ReactNode;
}

export default function GameWrapper({ gameId, children }: GameWrapperProps) {
  const game = getGameById(gameId);
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [topScores, setTopScores] = useState<any[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    if (gameId) {
      getUserBestScore(gameId).then(setBestScore);
      getTopScores(gameId, 5).then(setTopScores);
    }
  }, [gameId]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setLastScore(null);
    setScoreSaved(false);
  };

  const onGameOver = async (score: number) => {
    setIsPlaying(false);
    setGameOver(true);
    setLastScore(score);

    if (user) {
      const saved = await submitScore(gameId, score);
      setScoreSaved(saved);
      const newBest = await getUserBestScore(gameId);
      setBestScore(newBest);
      const newTop = await getTopScores(gameId, 5);
      setTopScores(newTop);
    }
  };

  if (!game) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Link href="/" className="btn-primary">
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>{game.icon}</span>
              {game.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {game.description}
            </p>
          </div>
          {bestScore !== null && (
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Best</div>
              <div className="text-lg font-bold text-arena-gold flex items-center gap-1">
                <Star className="w-4 h-4" />
                {bestScore}
              </div>
            </div>
          )}
        </div>

        {/* Game Area */}
        <div className="card mb-6">
          {!isPlaying && !gameOver && (
            <div className="text-center py-12">
              <span className="text-6xl mb-6 block">{game.icon}</span>
              <h2 className="text-xl font-bold mb-4">{game.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {game.description}
              </p>
              <button onClick={startGame} className="btn-primary text-lg">
                🎮 Start Game
              </button>
              {!user && (
                <p className="text-sm text-gray-400 mt-4">
                  <Link href="/signup" className="text-primary-500 hover:underline">
                    Create an account
                  </Link>{' '}
                  to save your scores!
                </p>
              )}
            </div>
          )}

          {(isPlaying || gameOver) && children({ onGameOver, isPlaying, startGame })}

          {gameOver && lastScore !== null && (
            <div className="text-center py-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <div className="text-5xl font-extrabold text-primary-600 dark:text-primary-400 mb-2">
                {lastScore}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">points</p>
              {scoreSaved && (
                <p className="text-green-500 text-sm mb-4">✓ Score saved!</p>
              )}
              {!user && (
                <p className="text-yellow-500 text-sm mb-4">
                  Sign in to save your scores
                </p>
              )}
              {bestScore !== null && lastScore >= bestScore && (
                <p className="text-arena-gold font-bold mb-4 animate-pop">
                  🏆 New Personal Best!
                </p>
              )}
              <button onClick={startGame} className="btn-primary">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Mini Leaderboard */}
        {topScores.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-arena-gold" />
              Top Scores
            </h3>
            <div className="space-y-2">
              {topScores.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : i === 1
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        : i === 2
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-sm">{entry.username}</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/leaderboard"
              className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline mt-4"
            >
              View Full Leaderboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
