import { db, getSession, json } from "../../../lib/backend";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: "로그인이 필요합니다." }, 401);
  const result = await db().prepare(`
    SELECT id, case_number AS caseNumber, story, title, order_text AS 'order', mood, score, outcome, created_at AS date
    FROM verdicts WHERE user_id = ? ORDER BY created_at DESC LIMIT 100
  `).bind(session.user.id).all();
  return json({ verdicts: result.results });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: "로그인이 필요합니다." }, 401);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const required = ["caseNumber", "story", "title", "order", "mood", "outcome"];
  if (required.some((key) => !String(body[key] || "").trim())) return json({ error: "판결 정보가 부족합니다." }, 400);
  const id = crypto.randomUUID();
  const date = new Date().toISOString();
  await db().prepare(`INSERT INTO verdicts (id, user_id, case_number, story, title, order_text, mood, score, outcome, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, session.user.id, body.caseNumber, body.story, body.title, body.order, body.mood, Number(body.score) || 0, body.outcome, date).run();
  return json({ verdict: { id, ...body, date } }, 201);
}

export async function DELETE(request: Request) {
  const session = await getSession(request);
  if (!session) return json({ error: "로그인이 필요합니다." }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "삭제할 판결이 없습니다." }, 400);
  await db().prepare("DELETE FROM verdicts WHERE id = ? AND user_id = ?").bind(id, session.user.id).run();
  return json({ ok: true });
}
