import { createClient } from '@/lib/supabase/client';

export async function submitScore(gameName: string, score: number): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase.from('game_scores').insert({
    user_id: user.id,
    game_name: gameName,
    score,
  });

  if (error) return false;

  // The matching function is defined in supabase/schema.sql. It checks that
  // the authenticated user can only increment their own profile counter.
  const { error: countError } = await supabase.rpc('increment_games_played', {
    user_id_input: user.id,
  });

  if (countError) {
    // The score itself was saved successfully. Keep that success result while
    // allowing the database/RPC error to be diagnosed in the browser console.
    console.error('Score saved, but games-played counter could not be updated:', countError.message);
  }

  return true;
}

export async function getTopScores(
  gameName: string,
  limit = 10
): Promise<
  { score: number; username: string; avatar_url: string | null; played_at: string }[]
> {
  const supabase = createClient();

  const { data } = await supabase
    .from('game_scores')
    .select('score, played_at, profiles(username, avatar_url)')
    .eq('game_name', gameName)
    .order('score', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((item: any) => ({
    score: item.score,
    played_at: item.played_at,
    username: item.profiles?.username || 'Unknown',
    avatar_url: item.profiles?.avatar_url || null,
  }));
}

export async function getUserBestScore(gameName: string): Promise<number | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('game_scores')
    .select('score')
    .eq('game_name', gameName)
    .eq('user_id', user.id)
    .order('score', { ascending: false })
    .limit(1)
    .single();

  return data?.score ?? null;
}
