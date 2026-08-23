import { createSession, db, json, makePassword, normalizeEmail, normalizeUsername, sessionCookie } from "../../../../lib/backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const username = normalizeUsername(body.username);
  const email = normalizeEmail(body.email);
  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  if (!/^[a-z0-9_]{4,24}$/.test(username)) return json({ error: "아이디는 영문 소문자·숫자·밑줄 4~24자로 입력해 주세요." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "올바른 이메일을 입력해 주세요." }, 400);
  if (name.length < 2 || name.length > 30) return json({ error: "이름은 2~30자로 입력해 주세요." }, 400);
  if (password.length < 8) return json({ error: "비밀번호는 8자 이상으로 입력해 주세요." }, 400);
  const exists = await db().prepare("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1").bind(username, email).first();
  if (exists) return json({ error: "이미 사용 중인 아이디 또는 이메일입니다." }, 409);
  const id = crypto.randomUUID();
  const credential = await makePassword(password);
  await db().prepare("INSERT INTO users (id, username, name, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, username, name, email, credential.hash, credential.salt, new Date().toISOString()).run();
  const token = await createSession(id);
  return json({ user: { id, username, name, email } }, 201, { "Set-Cookie": sessionCookie(token, request) });
}
