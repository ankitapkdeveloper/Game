'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GAMES, type GameInfo } from '@/lib/games';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Gamepad2, Star, Zap, Brain, Target } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  Strategy: <Brain className="w-4 h-4" />,
  Arcade: <Gamepad2 className="w-4 h-4" />,
  Puzzle: <Star className="w-4 h-4" />,
  Action: <Zap className="w-4 h-4" />,
  Skill: <Target className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
  Reflex: <Zap className="w-4 h-4" />,
};

const difficultyColors = {
  Easy: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  Medium: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  Hard: 'text-red-500 bg-red-100 dark:bg-red-900/30',
};

function GameCard({ game }: { game: GameInfo }) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="game-card group h-full">
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${game.color}`}
        />
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{game.icon}</span>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              difficultyColors[game.difficulty]
            }`}
          >
            {game.difficulty}
          </span>
        </div>
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {game.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {game.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          {categoryIcons[game.category]}
          <span>{game.category}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(GAMES.map((g) => g.category)))];

  const filtered =
    filter === 'All' ? GAMES : GAMES.filter((g) => g.category === filter);

  return (
    <div className="page-container">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-arena-accent/20 dark:from-primary-900/40 dark:to-arena-accent/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-arena-accent bg-clip-text text-transparent">
                Game Arena
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Play 10 exciting browser games, compete on leaderboards, and prove
              you&apos;re the ultimate champion!
            </p>
            <div className="flex items-center justify-center gap-4">
              {!user && (
                <Link href="/signup" className="btn-primary text-lg">
                  🎮 Start Playing
                </Link>
              )}
              <Link href="/leaderboard" className="btn-secondary text-lg">
                <Trophy className="w-5 h-5 mr-2" />
                Leaderboard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                10
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-arena-accent">∞</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Fun</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-arena-gold">🏆</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Compete
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            🎮 All Games
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === cat
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
