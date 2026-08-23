import { createSession, db, json, normalizeUsername, sessionCookie, verifyPassword } from "../../../../lib/backend";

type LoginRow = { id: string; username: string; name: string; email: string; passwordHash: string; passwordSalt: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const row = await db().prepare(`SELECT id, username, name, email, password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE username = ? LIMIT 1`)
    .bind(username).first<LoginRow>();
  if (!row || !(await verifyPassword(password, row.passwordSalt, row.passwordHash))) return json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, 401);
  const token = await createSession(row.id);
  return json({ user: { id: row.id, username: row.username, name: row.name, email: row.email } }, 200, { "Set-Cookie": sessionCookie(token, request) });
}
