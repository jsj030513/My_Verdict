import { getSession, json } from "../../../../lib/backend";

export async function GET(request: Request) {
  const session = await getSession(request);
  return session ? json({ user: session.user }) : json({ error: "로그인이 필요합니다." }, 401);
}
