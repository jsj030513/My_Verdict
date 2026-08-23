import { env } from "cloudflare:workers";

const sessionCookieName = "my_verdict_session";
const sessionDuration = 60 * 60 * 24 * 30;

export type AuthUser = { id: string; username: string; name: string; email: string };

export function db() {
  if (!env.DB) throw new Error("Database binding is unavailable");
  return env.DB;
}

function bytesToBase64(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

async function digest(value: string) {
  const data = new TextEncoder().encode(value);
  return bytesToBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", data)));
}

export async function makePassword(password: string, suppliedSalt?: string) {
  const salt = suppliedSalt || bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100_000 },
    key,
    256,
  );
  return { salt, hash: bytesToBase64(new Uint8Array(bits)) };
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const { hash } = await makePassword(password, salt);
  if (hash.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < hash.length; index += 1) difference |= hash.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}

function parseCookies(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return Object.fromEntries(cookie.split(";").map((item) => {
    const trimmed = item.trim();
    const separator = trimmed.indexOf("=");
    return separator < 0 ? [trimmed, ""] : [trimmed.slice(0, separator), trimmed.slice(separator + 1)];
  }).filter(([key]) => key));
}

export async function createSession(userId: string) {
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
  const id = await digest(token);
  const expiresAt = Date.now() + sessionDuration * 1000;
  await db().prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, userId, expiresAt, new Date().toISOString()).run();
  return token;
}

export async function getSession(request: Request): Promise<{ user: AuthUser; sessionId: string } | null> {
  const token = parseCookies(request)[sessionCookieName];
  if (!token) return null;
  const sessionId = await digest(token);
  const row = await db().prepare(`
    SELECT users.id, users.username, users.name, users.email, sessions.expires_at AS expiresAt
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.id = ? LIMIT 1
  `).bind(sessionId).first<AuthUser & { expiresAt: number }>();
  if (!row) return null;
  if (row.expiresAt <= Date.now()) {
    await db().prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
    return null;
  }
  return { user: { id: row.id, username: row.username, name: row.name, email: row.email }, sessionId };
}

export function sessionCookie(token: string, request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionDuration}${secure}`;
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, { status, headers });
}

export function normalizeUsername(value: unknown) { return String(value || "").trim().toLowerCase(); }
export function normalizeEmail(value: unknown) { return String(value || "").trim().toLowerCase(); }
