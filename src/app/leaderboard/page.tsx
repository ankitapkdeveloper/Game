'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GAMES } from '@/lib/games';
import { Trophy, Medal, Crown } from 'lucide-react';

interface LeaderboardEntry {
  username: string;
  avatar_url: string | null;
  score: number;
  played_at: string;
}

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState(GAMES[0].id);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalBoard, setGlobalBoard] = useState<
    { username: string; avatar_url: string | null; total_score: number }[]
  >([]);
  const [tab, setTab] = useState<'game' | 'global'>('global');

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  useEffect(() => {
    if (tab === 'game') {
      fetchGameLeaderboard(selectedGame);
    }
  }, [selectedGame, tab]);

  const fetchGlobalLeaderboard = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('game_scores')
      .select('user_id, score, profiles(username, avatar_url)')
      .order('score', { ascending: false });

    if (data) {
      const userScores: Record<string, { username: string; avatar_url: string | null; total_score: number }> = {};
      data.forEach((entry: any) => {
        const uid = entry.user_id;
        if (!userScores[uid]) {
          userScores[uid] = {
            username: entry.profiles?.username || 'Unknown',
            avatar_url: entry.profiles?.avatar_url || null,
            total_score: 0,
          };
        }
        userScores[uid].total_score += entry.score;
      });
      const sorted = Object.values(userScores).sort((a, b) => b.total_score - a.total_score);
      setGlobalBoard(sorted.slice(0, 50));
    }
    setLoading(false);
  };

  const fetchGameLeaderboard = async (gameName: string) => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('game_scores')
      .select('score, played_at, profiles(username, avatar_url)')
      .eq('game_name', gameName)
      .order('score', { ascending: false })
      .limit(50);

    if (data) {
      setEntries(
        data.map((item: any) => ({
          username: item.profiles?.username || 'Unknown',
          avatar_url: item.profiles?.avatar_url || null,
          score: item.score,
          played_at: item.played_at,
        }))
      );
    }
    setLoading(false);
  };

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="w-5 h-5 text-arena-gold" />;
    if (i === 1) return <Medal className="w-5 h-5 text-arena-silver" />;
    if (i === 2) return <Medal className="w-5 h-5 text-arena-bronze" />;
    return <span className="w-5 text-center text-sm font-bold text-gray-400">{i + 1}</span>;
  };

  const rankBg = (i: number) => {
    if (i === 0) return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
    if (i === 1) return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    if (i === 2) return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800';
    return 'border-transparent';
  };

  return (
    <div className="page-container min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-arena-gold" />
            Leaderboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            See who&apos;s dominating the arena!
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setTab('global')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              tab === 'global'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setTab('game')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              tab === 'game'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            🎮 By Game
          </button>
        </div>

        {/* Game selector */}
        {tab === 'game' && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedGame === game.id
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {game.icon} {game.name}
              </button>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">🎮</div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : tab === 'global' ? (
            globalBoard.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No scores yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {globalBoard.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${rankBg(i)}`}
                  >
                    <div className="w-8 flex justify-center">{rankIcon(i)}</div>
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 overflow-hidden">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        entry.username[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="flex-1 font-medium">{entry.username}</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {entry.total_score.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No scores for this game yet!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${rankBg(i)}`}
                >
                  <div className="w-8 flex justify-center">{rankIcon(i)}</div>
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      entry.username[0]?.toUpperCase()
                    )}
                  </div>
                  <span className="flex-1 font-medium">{entry.username}</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
