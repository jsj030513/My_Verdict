"use client";

import { FormEvent, useMemo, useState } from "react";

type Mood = "다정하게" | "단호하게" | "웃기게";

type Verdict = {
  title: string;
  order: string;
  reason: string;
  compensation: string;
  score: number;
  conscience: string;
};

const moods: Mood[] = ["다정하게", "단호하게", "웃기게"];

const samples = [
  "친구가 내 디저트를 한입만 먹는다더니 반을 먹었어요.",
  "팀장님이 퇴근 5분 전에 일을 주셨어요.",
  "애인이 제 메시지는 안 보고 릴스만 보내요.",
];

const verdicts: Record<Mood, Verdict[]> = {
  다정하게: [
    {
      title: "당신의 서운함은 충분히 타당합니다",
      order: "피고는 따뜻한 사과와 함께 다음 간식을 먼저 양보할 것.",
      reason:
        "작은 일처럼 보여도 기대했던 배려가 사라지면 마음은 생각보다 오래 허전해질 수 있습니다.",
      compensation: "좋아하는 디저트 1개",
      score: 94,
      conscience: "회복 가능",
    },
    {
      title: "오늘만큼은 당신 편에 서겠습니다",
      order: "피고는 변명보다 먼저 ‘그랬구나’를 세 번 말할 것.",
      reason:
        "해결책보다 내 마음을 알아주는 말 한마디가 먼저 필요한 사건으로 판단됩니다.",
      compensation: "방해 없는 휴식 40분",
      score: 91,
      conscience: "대화 필요",
    },
  ],
  단호하게: [
    {
      title: "참을 만큼 참았습니다",
      order: "피고는 즉시 사과하고 동일한 행동을 반복하지 않겠다는 약속을 제출할 것.",
      reason:
        "상대의 편의가 당신의 인내를 무제한으로 사용할 권리는 어디에도 없습니다.",
      compensation: "커피 2회 제공",
      score: 98,
      conscience: "긴급 점검",
    },
    {
      title: "선 넘음이 명백합니다",
      order: "피고에게 다음 약속의 선택권 박탈 및 계산 전담을 명합니다.",
      reason:
        "사소함을 핑계로 반복된 불편을 무시한 책임이 분명하다고 판단합니다.",
      compensation: "노터치 이용권 1일",
      score: 96,
      conscience: "주의 요망",
    },
  ],
  웃기게: [
    {
      title: "유죄. 꽤나 유죄.",
      order: "피고는 편의점 과자 3봉과 반성의 탕후루를 지급할 것.",
      reason:
        "마지막 한입은 식품이 아니라 신뢰였으며, 피고는 그 신뢰를 아주 맛있게 먹었습니다.",
      compensation: "초코우유 2개",
      score: 99,
      conscience: "배송 지연 중",
    },
    {
      title: "피고의 양심에 로그인이 필요합니다",
      order: "피고는 24시간 동안 모든 메뉴 결정권을 원고에게 양도할 것.",
      reason:
        "본 재판부는 피고의 눈치가 비행기 모드였음을 확인했습니다.",
      compensation: "소원 쿠폰 1장",
      score: 97,
      conscience: "오프라인",
    },
  ],
};

function makeCaseNumber() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}${day}-${Math.floor(100 + Math.random() * 900)}`;
}

export default function Home() {
  const [story, setStory] = useState("");
  const [mood, setMood] = useState<Mood>("웃기게");
  const [result, setResult] = useState<Verdict | null>(null);
  const [caseNumber, setCaseNumber] = useState("");
  const [verdictIndex, setVerdictIndex] = useState(0);
  const [shared, setShared] = useState(false);

  const charsLeft = 180 - story.length;
  const canSubmit = story.trim().length >= 8;

  const shortStory = useMemo(() => {
    if (story.length <= 88) return story;
    return `${story.slice(0, 88)}…`;
  }, [story]);

  function deliverVerdict(event?: FormEvent) {
    event?.preventDefault();
    if (!canSubmit) return;
    const list = verdicts[mood];
    const nextIndex = result ? (verdictIndex + 1) % list.length : 0;
    setVerdictIndex(nextIndex);
    setResult(list[nextIndex]);
    setCaseNumber(makeCaseNumber());
    setShared(false);
    window.setTimeout(() => {
      document.getElementById("verdict")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  }

  async function shareVerdict() {
    if (!result) return;
    const text = `내 편 판결소 판결\n“${shortStory}”\n\n${result.title}\n주문: ${result.order}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "내 편 판결소", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShared(true);
      }
    } catch {
      // 사용자가 공유 창을 닫은 경우 화면 상태를 유지합니다.
    }
  }

  function resetCourt() {
    setResult(null);
    setStory("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="내 편 판결소 홈">
          <span className="brand-mark">내편</span>
          <span>내 편 판결소</span>
        </a>
        <span className="open-status"><i /> 오늘도 재판 중</span>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span>⚖</span> 24시간 당신 편</div>
        <h1>그건 좀<br /><em>억울했겠다.</em></h1>
        <p className="hero-copy">
          말 못 하고 삼킨 오늘의 억울함,<br />우리 재판부가 속 시원히 판결해 드려요.
        </p>

        <form className="case-form" onSubmit={deliverVerdict}>
          <label htmlFor="story">오늘 무슨 일이 있었나요?</label>
          <div className="textarea-wrap">
            <textarea
              id="story"
              value={story}
              onChange={(event) => setStory(event.target.value.slice(0, 180))}
              placeholder="예: 팀장님이 퇴근 5분 전에 일을 주셨어요..."
              rows={5}
              aria-describedby="story-help"
            />
            <span id="story-help" className={charsLeft < 20 ? "count warning" : "count"}>
              {story.length}/180
            </span>
          </div>

          <div className="sample-row" aria-label="사건 예시">
            <span>이런 사건도 가능해요</span>
            <div>
              {samples.map((sample, index) => (
                <button key={sample} type="button" onClick={() => setStory(sample)}>
                  {index === 0 ? "🍰 디저트 사건" : index === 1 ? "💼 퇴근 사건" : "💬 연락 사건"}
                </button>
              ))}
            </div>
          </div>

          <fieldset>
            <legend>오늘의 판결 온도</legend>
            <div className="mood-picker">
              {moods.map((item) => (
                <label key={item} className={mood === item ? "selected" : ""}>
                  <input
                    type="radio"
                    name="mood"
                    value={item}
                    checked={mood === item}
                    onChange={() => {
                      setMood(item);
                      setResult(null);
                    }}
                  />
                  <span>{item === "다정하게" ? "포근" : item === "단호하게" ? "엄격" : "유쾌"}</span>
                  <strong>{item}</strong>
                </label>
              ))}
            </div>
          </fieldset>

          <button className="primary-button" disabled={!canSubmit} type="submit">
            <span>판결 받아보기</span><b>→</b>
          </button>
          {!canSubmit && story.length > 0 && <p className="form-hint">조금만 더 자세히 들려주세요.</p>}
        </form>
      </section>

      <section className="promise">
        <p>판결소의 원칙</p>
        <div>
          <span>하나.</span>
          <strong>당신의 감정을<br />사소하게 보지 않습니다.</strong>
        </div>
        <div>
          <span>둘.</span>
          <strong>현실적인 해결보다<br />오늘은 속 시원함이 먼저입니다.</strong>
        </div>
        <small>입력한 내용은 이 기기에 저장되지 않아요.</small>
      </section>

      {result && (
        <section className="result-section" id="verdict" aria-live="polite">
          <div className="result-heading">
            <span>판결이 도착했습니다</span>
            <h2>주문</h2>
          </div>

          <article className="verdict-card">
            <div className="card-topline">
              <span>사건번호 {caseNumber}</span>
              <span>내 편 지방법원</span>
            </div>
            <div className="stamp" aria-hidden="true">당신<br />승소</div>
            <p className="case-summary">“{shortStory}”</p>
            <h3>{result.title}</h3>

            <div className="ruling">
              <span>주문</span>
              <p>{result.order}</p>
            </div>

            <div className="reason">
              <span>판결 이유</span>
              <p>{result.reason}</p>
            </div>

            <div className="verdict-stats">
              <div><span>억울함 인정</span><strong>{result.score}%</strong></div>
              <div><span>오늘의 위자료</span><strong>{result.compensation}</strong></div>
              <div><span>피고의 양심</span><strong>{result.conscience}</strong></div>
            </div>

            <div className="judge-sign">
              <span>내 편 판결소 재판장</span>
              <strong>편들어 판사</strong>
            </div>
          </article>

          <div className="result-actions">
            <button className="share-button" type="button" onClick={shareVerdict}>
              {shared ? "판결문이 복사됐어요 ✓" : "판결 공유하기"}
            </button>
            <button className="appeal-button" type="button" onClick={() => deliverVerdict()}>
              이 판결 아쉬워요 · 재심 요청
            </button>
            <button className="new-case-button" type="button" onClick={resetCourt}>
              새로운 사건 접수하기
            </button>
          </div>
        </section>
      )}

      <footer>
        <span className="footer-mark">내편</span>
        <p>해결은 못 해도, 당신 편은 되어드릴게요.</p>
        <small>본 서비스의 판결은 법적 효력이 없는 유쾌한 위로입니다.</small>
      </footer>
    </main>
  );
}
