"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Filter = "전체" | "다정하게" | "단호하게" | "웃기게";

type SavedVerdict = {
  id: string;
  caseNumber: string;
  story: string;
  title: string;
  order: string;
  mood: Exclude<Filter, "전체">;
  score: number;
  date: string;
};

const archiveKey = "my-verdict-archive";
const demoVerdicts: SavedVerdict[] = [
  {
    id: "demo-1",
    caseNumber: "2026-0821-317",
    story: "친구가 한입만 먹는다더니 제 디저트의 반을 먹었어요.",
    title: "유죄. 꽤나 유죄.",
    order: "피고는 편의점 과자 3봉과 반성의 탕후루를 지급할 것.",
    mood: "웃기게",
    score: 99,
    date: "2026-08-21T11:20:00.000Z",
  },
  {
    id: "demo-2",
    caseNumber: "2026-0818-142",
    story: "팀장님이 퇴근 5분 전에 오늘 안으로 해달라며 일을 주셨어요.",
    title: "참을 만큼 참았습니다",
    order: "피고는 즉시 사과하고 다음 퇴근 시간을 온전히 보장할 것.",
    mood: "단호하게",
    score: 98,
    date: "2026-08-18T09:15:00.000Z",
  },
  {
    id: "demo-3",
    caseNumber: "2026-0812-089",
    story: "친구들이 약속 시간을 바꾸고 저에게만 늦게 알려줬어요.",
    title: "당신의 서운함은 충분히 타당합니다",
    order: "피고들은 다음 약속에서 원고의 시간과 메뉴 선택을 우선할 것.",
    mood: "다정하게",
    score: 94,
    date: "2026-08-12T05:40:00.000Z",
  },
];

const filters: Filter[] = ["전체", "다정하게", "단호하게", "웃기게"];

export default function ArchivePage() {
  const [records, setRecords] = useState<SavedVerdict[]>([]);
  const [filter, setFilter] = useState<Filter>("전체");
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(archiveKey) || "[]") as SavedVerdict[];
      setRecords(saved.length ? saved : demoVerdicts);
    } catch {
      setRecords(demoVerdicts);
    }
    setReady(true);
  }, []);

  const filtered = useMemo(
    () => filter === "전체" ? records : records.filter((record) => record.mood === filter),
    [filter, records],
  );
  const averageScore = records.length
    ? Math.round(records.reduce((sum, record) => sum + record.score, 0) / records.length)
    : 0;

  function removeRecord(id: string) {
    const next = records.filter((record) => record.id !== id);
    setRecords(next);
    setExpanded(null);
    try {
      window.localStorage.setItem(archiveKey, JSON.stringify(next));
    } catch {
      // 화면에서 삭제한 상태는 유지합니다.
    }
  }

  function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = String(form.get("archive-new-password") || "");
    const confirm = String(form.get("archive-confirm-password") || "");
    if (next.length < 8) {
      setPasswordError("새 비밀번호는 8자 이상으로 입력해 주세요.");
      setPasswordNotice("");
      return;
    }
    if (next !== confirm) {
      setPasswordError("새 비밀번호가 서로 일치하지 않아요.");
      setPasswordNotice("");
      return;
    }
    setPasswordError("");
    setPasswordNotice("새 비밀번호가 확인되었습니다. 백엔드 연결 후 실제 계정에 반영돼요.");
    event.currentTarget.reset();
  }

  return (
    <main className="archive-page">
      <header className="topbar archive-topbar">
        <Link className="brand" href="/court" aria-label="내 편 판결소">
          <span className="brand-mark">내편</span><span>내 편 판결소</span>
        </Link>
        <nav className="archive-nav" aria-label="주요 메뉴">
          <Link href="/court">판결받기</Link>
          <Link className="active" href="/archive">판결 보관소</Link>
        </nav>
      </header>

      <section className="archive-hero">
        <div>
          <span className="archive-eyebrow">MY VERDICT ARCHIVE</span>
          <h1>판결 보관소</h1>
          <p>당신의 마음이 정당했다는 기록을 모아두었어요.</p>
        </div>
        <div className="profile-seal" aria-label="사용자 프로필"><span>원고</span><strong>내편이</strong></div>
      </section>

      <section className="archive-stats" aria-label="판결 통계">
        <div><span>보관된 판결</span><strong>{ready ? records.length : "—"}<small>건</small></strong></div>
        <div><span>평균 억울함 인정</span><strong>{ready ? averageScore : "—"}<small>%</small></strong></div>
        <div><span>가장 많이 받은 판결</span><strong className="stat-copy">당신 승소</strong></div>
      </section>

      <section className="archive-content">
        <div className="archive-section-heading">
          <div><span>CASE FILES</span><h2>나의 판결 기록</h2></div>
          <div className="archive-filters" aria-label="판결 분위기 필터">
            {filters.map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} type="button">{item}</button>
            ))}
          </div>
        </div>

        <div className="archive-list">
          {ready && filtered.length === 0 ? (
            <div className="archive-empty"><strong>아직 보관된 판결이 없어요.</strong><p>오늘의 억울함을 들려주면 첫 판결문을 보관해 드릴게요.</p><Link href="/court">첫 사건 접수하기 →</Link></div>
          ) : filtered.map((record) => (
            <article className={expanded === record.id ? "archive-card expanded" : "archive-card"} key={record.id}>
              <button className="archive-card-main" type="button" onClick={() => setExpanded(expanded === record.id ? null : record.id)} aria-expanded={expanded === record.id}>
                <span className={`mood-dot mood-${record.mood}`}>{record.mood}</span>
                <div><small>사건번호 {record.caseNumber}</small><h3>{record.title}</h3><p>“{record.story}”</p></div>
                <time dateTime={record.date}>{new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date(record.date))}</time>
                <b aria-hidden="true">⌄</b>
              </button>
              {expanded === record.id && (
                <div className="archive-card-detail">
                  <div><span>주문</span><p>{record.order}</p></div>
                  <div className="archive-card-meta"><span>억울함 인정 {record.score}%</span><button type="button" onClick={() => removeRecord(record.id)}>기록 삭제</button></div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="account-settings">
        <div className="settings-intro"><span>ACCOUNT SETTINGS</span><h2>계정 설정</h2><p>로그인 정보와 계정 상태를 관리할 수 있어요.</p></div>
        <div className="settings-grid">
          <div className="account-summary"><span>로그인 계정</span><strong>myverdict</strong><small>myv****@example.com</small><Link href="/login">로그아웃</Link></div>
          <form className="password-form" onSubmit={resetPassword}>
            <div><h3>비밀번호 재설정</h3><p>안전한 비밀번호로 주기적으로 변경해 주세요.</p></div>
            <label>현재 비밀번호<input name="archive-current-password" type="password" autoComplete="current-password" required placeholder="현재 비밀번호" /></label>
            <div className="password-row">
              <label>새 비밀번호<input name="archive-new-password" type="password" autoComplete="new-password" required placeholder="8자 이상" /></label>
              <label>새 비밀번호 확인<input name="archive-confirm-password" type="password" autoComplete="new-password" required placeholder="한 번 더 입력" /></label>
            </div>
            <button type="submit">비밀번호 변경하기</button>
            {passwordError && <p className="settings-error" role="alert">{passwordError}</p>}
            {passwordNotice && <p className="settings-notice" role="status">{passwordNotice}</p>}
            <small className="settings-prototype">현재는 프론트엔드 확인 단계이며 실제 변경은 백엔드 연결 후 적용됩니다.</small>
          </form>
        </div>
      </section>

      <footer><span className="footer-mark">내편</span><p>당신의 마음이 정당했다는 기록.</p><small>판결 기록은 현재 이 기기의 브라우저에만 보관됩니다.</small></footer>
    </main>
  );
}
