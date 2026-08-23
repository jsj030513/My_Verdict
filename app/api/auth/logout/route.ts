import { clearSessionCookie, db, getSession, json } from "../../../../lib/backend";

export async function POST(request: Request) {
  const session = await getSession(request);
  if (session) await db().prepare("DELETE FROM sessions WHERE id = ?").bind(session.sessionId).run();
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie(request) });
}
