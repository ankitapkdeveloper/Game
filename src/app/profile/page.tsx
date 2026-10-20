'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { GAMES } from '@/lib/games';
import { Camera, Edit3, Save, X, Trophy, Gamepad2, Calendar } from 'lucide-react';

interface GameStat {
  game_name: string;
  best_score: number;
  games_played: number;
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      fetchGameStats();
    }
  }, [profile]);

  const fetchGameStats = async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('game_scores')
      .select('game_name, score')
      .eq('user_id', user.id)
      .order('score', { ascending: false });

    if (data) {
      const statsMap: Record<string, { best: number; count: number }> = {};
      let total = 0;
      data.forEach((row: any) => {
        total += row.score;
        if (!statsMap[row.game_name]) {
          statsMap[row.game_name] = { best: row.score, count: 0 };
        }
        statsMap[row.game_name].count++;
        if (row.score > statsMap[row.game_name].best) {
          statsMap[row.game_name].best = row.score;
        }
      });
      setTotalScore(total);
      setGameStats(
        Object.entries(statsMap).map(([name, s]) => ({
          game_name: name,
          best_score: s.best,
          games_played: s.count,
        }))
      );
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      await refreshProfile();
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">🎮</div>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-container min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-4xl font-bold text-primary-600 overflow-hidden border-4 border-primary-200 dark:border-primary-800">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.username[0]?.toUpperCase()
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
                disabled={uploading}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    placeholder="Display Name"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary text-sm">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl font-bold">
                      {profile.display_name || profile.username}
                    </h1>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
                  {profile.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 justify-center sm:justify-start">
                    <Calendar className="w-3 h-3" />
                    Member since {memberSince}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-arena-gold" />
            <div className="text-2xl font-bold">{totalScore.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Score</div>
          </div>
          <div className="card text-center">
            <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-primary-500" />
            <div className="text-2xl font-bold">{gameStats.reduce((a, b) => a + b.games_played, 0)}</div>
            <div className="text-xs text-gray-500">Games Played</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-2xl font-bold">{gameStats.length}</div>
            <div className="text-xs text-gray-500">Games Tried</div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">🎮 Game Stats</h2>
          {gameStats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No games played yet. Start playing!
            </p>
          ) : (
            <div className="space-y-3">
              {gameStats.map((stat) => {
                const game = GAMES.find((g) => g.id === stat.game_name);
                return (
                  <div
                    key={stat.game_name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <span className="text-2xl">{game?.icon || '🎮'}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {game?.name || stat.game_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stat.games_played} games played
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-600 dark:text-primary-400">
                        {stat.best_score}
                      </div>
                      <div className="text-xs text-gray-500">Best</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
