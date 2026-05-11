/**
 * dev-login.ts — bypass magic-link auth in local dev.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx tsx scripts/dev-login.ts priya@eastside.coop
 *
 * Inserts a 30-day session for the given email and prints a URL you can
 * paste into your browser to sign in instantly. Never use in production.
 */

import { randomBytes } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/dev-login.ts <email>');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

function ulid(): string {
  // Minimal ULID: timestamp (10 chars) + random (16 chars)
  const ts = Date.now();
  const tsPart = ts.toString(32).toUpperCase().padStart(10, '0').slice(-10);
  const randPart = randomBytes(10)
    .toString('base64url')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 16)
    .padEnd(16, '0');
  return (tsPart + randPart).slice(0, 26);
}

async function main() {
  const pool = new Pool({ connectionString: url });
  try {
    const client = await pool.connect();

    // Find or create member
    const existing = await client.query('SELECT id FROM members WHERE email = $1 LIMIT 1', [email]);
    let memberId: string;
    if (existing.rows[0]) {
      memberId = existing.rows[0].id;
    } else {
      console.error(`No member found with email ${email}. Run the seed script first.`);
      process.exit(1);
    }

    // Create session
    const sessionId = ulid();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await client.query(`INSERT INTO sessions (id, member_id, expires_at) VALUES ($1, $2, $3)`, [
      sessionId,
      memberId,
      expiresAt,
    ]);

    client.release();

    console.log(`\nSession created for ${email} (member ${memberId})`);
    console.log(`\nOpen this URL in your browser:\n`);
    console.log(`  http://localhost:3000/dev-set-session?id=${sessionId}`);
    console.log(`\nOr set the cookie manually:`);
    console.log(`  document.cookie = 'cg_session=${sessionId}; path=/; max-age=2592000'`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
