import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function DELETE() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Account deletion is not configured on the server.' },
      { status: 503 }
    );
  }

  const sessionClient = createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await sessionClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  // The service-role key is used only in this server route and is never exposed
  // to the browser. Deleting auth.users cascades to the profile and game scores.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Remove any avatar files first so account deletion does not leave public files behind.
  const { data: avatarFiles, error: listError } = await adminClient.storage
    .from('avatars')
    .list(user.id);

  if (listError) {
    return NextResponse.json(
      { error: 'Unable to prepare account data for deletion. Please try again.' },
      { status: 500 }
    );
  }

  if (avatarFiles?.length) {
    const { error: avatarDeleteError } = await adminClient.storage
      .from('avatars')
      .remove(avatarFiles.map((file) => `${user.id}/${file.name}`));

    if (avatarDeleteError) {
      return NextResponse.json(
        { error: 'Unable to remove avatar files. Please try again.' },
        { status: 500 }
      );
    }
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: 'Unable to delete the account. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
