import { sql } from '@vercel/postgres';

export { sql };

// Database initialization
export async function initializeDatabase() {
  try {
    // Check if tables exist
    const { rows } = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users';
    `;

    if (rows.length === 0) {
      console.log('Database tables not found. Please run the schema.sql file to initialize the database.');
      console.log('You can run: psql $POSTGRES_URL -f lib/db/schema.sql');
    }

    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// User operations
export async function getUserByGithubId(githubId: number) {
  const { rows } = await sql`
    SELECT * FROM users WHERE github_id = ${githubId} LIMIT 1;
  `;
  return rows[0] || null;
}

export async function createUser(data: {
  id: string;
  email?: string;
  name?: string;
  githubUsername: string;
  githubId: number;
  avatarUrl?: string;
  bio?: string;
  publicGists?: number;
}) {
  const { rows } = await sql`
    INSERT INTO users (
      id, email, name, github_username, github_id, avatar_url, bio, public_gists
    ) VALUES (
      ${data.id}, ${data.email || null}, ${data.name || null}, 
      ${data.githubUsername}, ${data.githubId}, ${data.avatarUrl || null}, 
      ${data.bio || null}, ${data.publicGists || 0}
    )
    RETURNING *;
  `;
  return rows[0];
}

export async function updateUser(userId: string, data: Partial<{
  email: string;
  name: string;
  avatarUrl: string;
  bio: string;
  publicGists: number;
}>) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.avatarUrl !== undefined) {
    updates.push(`avatar_url = $${paramIndex++}`);
    values.push(data.avatarUrl);
  }
  if (data.bio !== undefined) {
    updates.push(`bio = $${paramIndex++}`);
    values.push(data.bio);
  }
  if (data.publicGists !== undefined) {
    updates.push(`public_gists = $${paramIndex++}`);
    values.push(data.publicGists);
  }

  if (updates.length === 0) return null;

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  const { rows } = await sql.query(query, values);
  return rows[0] || null;
}

// Settings operations
export async function getUserSettings(userId: string) {
  const { rows } = await sql`
    SELECT * FROM user_settings WHERE user_id = ${userId} LIMIT 1;
  `;
  return rows[0] || null;
}

export async function createDefaultSettings(userId: string) {
  const { rows } = await sql`
    INSERT INTO user_settings (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
    RETURNING *;
  `;
  return rows[0];
}

export async function updateUserSettings(userId: string, settings: Record<string, any>) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'telemetry_enabled', 'telemetry_api_key', 'auto_preview_markdown',
    'default_theme', 'show_line_numbers', 'font_size', 
    'enable_syntax_highlighting', 'auto_load_gists', 'history_limit',
    'compact_mode', 'enable_animations', 'wrap_long_lines'
  ];

  for (const [key, value] of Object.entries(settings)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (updates.length === 0) return null;

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE user_settings 
    SET ${updates.join(', ')}
    WHERE user_id = $${paramIndex}
    RETURNING *;
  `;

  const { rows } = await sql.query(query, values);
  return rows[0] || null;
}

// Gist history operations
export async function addToGistHistory(data: {
  userId: string;
  gistId: string;
  gistOwner?: string;
  gistDescription?: string;
  fileCount?: number;
}) {
  const { rows } = await sql`
    INSERT INTO gist_history (user_id, gist_id, gist_owner, gist_description, file_count)
    VALUES (${data.userId}, ${data.gistId}, ${data.gistOwner || null}, 
            ${data.gistDescription || null}, ${data.fileCount || 0})
    ON CONFLICT (user_id, gist_id) 
    DO UPDATE SET viewed_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  return rows[0];
}

export async function getUserGistHistory(userId: string, limit: number = 10) {
  const { rows } = await sql`
    SELECT * FROM gist_history 
    WHERE user_id = ${userId}
    ORDER BY viewed_at DESC
    LIMIT ${limit};
  `;
  return rows;
}

// Custom styles operations
export async function getCustomStyles(userId: string, target?: string) {
  if (target) {
    const { rows } = await sql`
      SELECT * FROM custom_styles 
      WHERE user_id = ${userId} AND target = ${target}
      LIMIT 1;
    `;
    return rows[0] || null;
  }

  const { rows } = await sql`
    SELECT * FROM custom_styles WHERE user_id = ${userId};
  `;
  return rows;
}

export async function upsertCustomStyle(data: {
  userId: string;
  target: string;
  css: string;
  enabled: boolean;
}) {
  const { rows } = await sql`
    INSERT INTO custom_styles (user_id, target, css, enabled, last_modified)
    VALUES (${data.userId}, ${data.target}, ${data.css}, ${data.enabled}, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, target)
    DO UPDATE SET 
      css = ${data.css},
      enabled = ${data.enabled},
      last_modified = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  return rows[0];
}

export async function deleteCustomStyle(userId: string, target: string) {
  await sql`
    DELETE FROM custom_styles 
    WHERE user_id = ${userId} AND target = ${target};
  `;
}
