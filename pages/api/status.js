export default function handler(req, res) {
  const hasUrl = Boolean(process.env.SUPABASE_URL);
  const hasAnon = Boolean(process.env.SUPABASE_ANON_KEY);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const storageMode = hasUrl && (hasAnon || hasServiceRole) ? 'supabase' : 'file';
  const writeRecommended = storageMode === 'supabase';

  return res.status(200).json({
    ok: true,
    storageMode,
    hasSupabaseUrl: hasUrl,
    hasAnonKey: hasAnon,
    hasServiceRoleKey: hasServiceRole,
    writeRecommended,
    note:
      storageMode === 'supabase'
        ? 'Persistent cloud storage is enabled.'
        : 'File storage is active. On Vercel, writes can fail unless Supabase is configured.'
  });
}
