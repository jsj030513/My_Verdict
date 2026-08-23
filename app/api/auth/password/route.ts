import { db, getSession, json, makePassword, verifyPassword } from "../../../../lib/backend";

type PasswordRow = { passwordHash: string; passwordSalt: string };

export async function PUT(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: "로그인이 필요합니다." }, 401);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  if (newPassword.length < 8) return json({ error: "새 비밀번호는 8자 이상이어야 합니다." }, 400);
  const row = await db().prepare("SELECT password_hash AS passwordHash, password_salt AS passwordSalt FROM users WHERE id = ?")
    .bind(session.user.id).first<PasswordRow>();
  if (!row || !(await verifyPassword(currentPassword, row.passwordSalt, row.passwordHash))) return json({ error: "현재 비밀번호가 올바르지 않습니다." }, 401);
  const credential = await makePassword(newPassword);
  await db().prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?")
    .bind(credential.hash, credential.salt, session.user.id).run();
  await db().prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").bind(session.user.id, session.sessionId).run();
  return json({ ok: true });
}
