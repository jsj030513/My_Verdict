import { db, json, normalizeEmail } from "../../../../lib/backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const email = normalizeEmail(body.email);
  const row = await db().prepare("SELECT username FROM users WHERE name = ? AND email = ? LIMIT 1").bind(name, email).first<{ username: string }>();
  if (!row) return json({ error: "일치하는 회원정보를 찾지 못했습니다." }, 404);
  const visible = row.username.slice(0, Math.min(3, row.username.length));
  return json({ maskedUsername: `${visible}${"*".repeat(Math.max(2, row.username.length - visible.length))}` });
}
