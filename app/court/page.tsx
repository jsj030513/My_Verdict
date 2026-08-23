"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

type Mood = "다정하게" | "단호하게" | "웃기게";
type Outcome = "승소" | "일부 승소" | "쌍방 과실" | "패소" | "증거 불충분";

type Verdict = {
  title: string;
  order: string;
  reason: string;
  compensation: string;
  score: number;
  conscience: string;
  outcome: Outcome;
  evidence: string[];
};

type SavedVerdict = {
  id: string;
  caseNumber: string;
  story: string;
  title: string;
  order: string;
  mood: Mood;
  score: number;
  outcome: Outcome;
  date: string;
};

const archiveKey = "my-verdict-archive";

const moods: Mood[] = ["다정하게", "단호하게", "웃기게"];
const judgingMessages = [
  "사건 진술을 꼼꼼히 읽는 중",
  "원고와 피고의 책임을 비교하는 중",
  "판결문에 유머 한 스푼 추가 중",
  "판결봉을 두드리는 중",
];

const samples = [
  "친구가 내 디저트를 한입만 먹는다더니 반을 먹었어요.",
  "팀장님이 퇴근 5분 전에 일을 주셨어요.",
  "애인이 제 메시지는 안 보고 릴스만 보내요.",
];

const titles: Record<Mood, Record<Outcome, string[]>> = {
  다정하게: {
    승소: ["당신의 서운함은 충분히 타당합니다", "마음의 손을 들어드립니다", "참아온 마음에 승소를 선고합니다"],
    "일부 승소": ["서운함은 인정, 오해는 조금 덜어냅니다", "당신 마음의 절반 이상은 옳았습니다", "섭섭할 이유가 충분했습니다"],
    "쌍방 과실": ["두 마음 모두 잠깐 길을 잃었습니다", "서로에게 한 걸음씩 필요합니다", "이번 사건은 함께 풀어야 합니다"],
    패소: ["이번만큼은 상대의 마음도 살펴봅니다", "서운함과 잘못은 별개의 문제입니다", "따뜻하지만 솔직한 패소입니다"],
    "증거 불충분": ["마음은 들었지만 사실이 조금 더 필요합니다", "아직 판결봉을 내려놓겠습니다", "서둘러 단정하지 않기로 합니다"],
  },
  단호하게: {
    승소: ["선 넘음이 명백합니다", "참을 만큼 참았습니다", "피고의 책임이 분명합니다"],
    "일부 승소": ["억울함은 인정하되 전부는 아닙니다", "피고에게 더 큰 책임이 있습니다", "원고의 주장을 일부 받아들입니다"],
    "쌍방 과실": ["양측 모두 반성문을 제출하십시오", "누구도 완전히 자유롭지 않습니다", "서로 한 번씩 선을 넘었습니다"],
    패소: ["이번 사건은 원고 패소입니다", "솔직히 이번에는 당신 잘못입니다", "편은 들지만 판결은 냉정합니다"],
    "증거 불충분": ["주장만으로는 판결할 수 없습니다", "정황은 있으나 결정타가 없습니다", "추가 진술을 명합니다"],
  },
  웃기게: {
    승소: ["유죄. 꽤나 유죄.", "피고의 양심에 로그인이 필요합니다", "원고 승. 이의 제기는 간식으로만 받습니다"],
    "일부 승소": ["반쯤 유죄, 간식은 온전히 배상", "원고 우세 판정승입니다", "억울함 7, 오해 3으로 판결합니다"],
    "쌍방 과실": ["둘 다 유죄, 둘 다 귀여운 벌금형", "쌍방의 눈치가 비행기 모드였습니다", "이번 싸움의 승자는 배달앱뿐입니다"],
    패소: ["원고의 양심도 출석해 주세요", "반전입니다. 이번 피고는 당신입니다", "편들기 실패. 증거가 너무 솔직했습니다"],
    "증거 불충분": ["재판부도 눈치만 보는 중입니다", "사건이 너무 짧아 판결봉이 멈췄습니다", "목격자 한 명 또는 카톡 세 줄을 요청합니다"],
  },
};

const orders: Record<Outcome, string[]> = {
  승소: ["피고는 진심 어린 사과와 원고가 고른 간식 1회를 지급할 것.", "피고는 다음 약속의 선택권을 원고에게 양도할 것.", "피고는 변명 없이 ‘그건 내가 미안해’를 먼저 말할 것."],
  "일부 승소": ["피고는 사과하고, 원고도 오해한 부분 한 가지를 인정할 것.", "피고 70%, 원고 30%의 비율로 화해 비용을 부담할 것.", "두 사람은 각자 한 문장씩만 해명한 뒤 메뉴 선택권을 원고에게 줄 것."],
  "쌍방 과실": ["양측은 반성 간식비를 절반씩 부담하고 먼저 웃는 쪽이 이길 것.", "서로의 잘못 하나씩만 인정하고 오늘의 논쟁을 종료할 것.", "양측 모두 사과문 대신 커피 두 잔을 들고 대화할 것."],
  패소: ["원고는 쿨하게 잘못을 인정하고 작은 사과를 먼저 건넬 것.", "원고는 변명 24시간 금지 및 다음 약속 배려형에 처할 것.", "원고는 피고에게 사과하고 본인 몫의 간식을 직접 조달할 것."],
  "증거 불충분": ["원고는 누가, 언제, 무엇을 했는지 보강하여 재접수할 것.", "판결을 보류하고 구체적인 대화 한 줄을 추가 제출할 것.", "양측은 섣부른 유죄 추정 없이 추가 진술을 준비할 것."],
};

const reasonOpeners: Record<Outcome, string[]> = {
  승소: ["상대의 반복된 무시 또는 약속 위반 정황이 확인되었습니다.", "진술 속 배려의 불균형이 원고에게 일방적으로 기울어 있습니다.", "원고가 감당한 불편에 비해 피고의 설명이 충분하지 않습니다."],
  "일부 승소": ["서운함의 원인은 분명하지만 양쪽 사정이 함께 보입니다.", "피고의 책임이 더 크지만 원고의 표현에도 아쉬움이 남습니다.", "원고의 감정은 타당하나 모든 책임을 상대에게 묻기는 어렵습니다."],
  "쌍방 과실": ["진술에서 양측의 실수와 감정적인 대응이 동시에 확인되었습니다.", "누가 먼저였는지보다 서로의 배려가 동시에 부족했던 사건입니다.", "한쪽만 탓하면 다음 재판이 너무 빨리 열릴 가능성이 큽니다."],
  패소: ["원고가 먼저 약속을 어기거나 잘못을 인정한 정황이 더 강합니다.", "속상한 마음과 별개로 이번 행동의 책임은 원고에게 있습니다.", "재판부는 편들기보다 솔직한 사과가 더 도움이 된다고 판단했습니다."],
  "증거 불충분": ["현재 진술만으로는 누구의 책임이 더 큰지 가르기 어렵습니다.", "감정은 충분히 전달됐지만 사건의 행동과 순서가 아직 모호합니다.", "억울함의 크기보다 구체적인 사실 한두 가지가 더 필요합니다."],
};

const moodClosers: Record<Mood, string[]> = {
  다정하게: ["마음을 지키면서도 관계를 다치게 하지 않는 대화가 필요합니다.", "누가 이기느냐보다 당신의 마음이 제대로 전해지는 것이 먼저입니다.", "오늘의 감정은 무시하지 말고 천천히 말해도 괜찮습니다."],
  단호하게: ["같은 일이 반복되지 않도록 기준을 분명히 세워야 합니다.", "사과 없는 변명은 정상참작하지 않겠습니다.", "배려는 선택 사항이 아니라 관계의 기본 의무입니다."],
  웃기게: ["본 재판부는 양심의 와이파이 상태까지 면밀히 살폈습니다.", "다음 사건 접수 전 간식 합의서 작성을 강력히 권고합니다.", "단, 배고픈 상태의 항소는 모두 기각합니다."],
};

const compensationByOutcome: Record<Outcome, string[]> = {
  승소: ["최애 간식 1개", "메뉴 선택권 1회", "방해 없는 휴식 40분"],
  "일부 승소": ["커피 반반 부담", "디저트 우선권", "칭찬 3회"],
  "쌍방 과실": ["화해용 커피 2잔", "산책 20분", "서로의 소원 1개"],
  패소: ["진심 어린 사과 1회", "반성 간식 직접 구매", "먼저 연락하기"],
  "증거 불충분": ["추가 진술 2줄", "심호흡 3회", "대화 캡처 1건"],
};

const conscienceByOutcome: Record<Outcome, string[]> = {
  승소: ["점검 필요", "업데이트 지연", "경고등 점등"],
  "일부 승소": ["양쪽 점검", "대화 대기", "회복 가능"],
  "쌍방 과실": ["동시 재부팅", "반반 흐림", "화해 필요"],
  패소: ["원고 호출 중", "솔직함 필요", "사과 권장"],
  "증거 불충분": ["판독 보류", "신호 약함", "추가 접수"],
};

const selfSignals = [
  { pattern: /(제가|내가).*(늦|깜빡|잊|취소|거짓말|화냈|화를 냈|먹었|잘못)/, label: "원고의 선행 실수" },
  { pattern: /(제가|내가).*(먼저|일방적|약속을 어|연락을 안)/, label: "원고의 책임 진술" },
  { pattern: /(제 잘못|내 잘못|제가 잘못|내가 잘못)/, label: "잘못 인정" },
];
const otherSignals = [
  { pattern: /(친구|애인|남친|여친|팀장|상사|동료|남편|아내|상대).*(무시|늦|먹|욕|막말|거짓말|취소|잠수|안 보|일을 주|소리)/, label: "상대의 문제 행동" },
  { pattern: /(반복|맨날|항상|또 |매번)/, label: "반복된 행동" },
  { pattern: /(약속을 어|연락 안|답장 안|말도 없이|허락 없이|반을 먹|퇴근.*일)/, label: "약속·배려 위반" },
];

function pick<T>(items: T[]) { return items[Math.floor(Math.random() * items.length)]; }

function buildVerdict(story: string, mood: Mood): Verdict {
  const selfEvidence = selfSignals.filter((signal) => signal.pattern.test(story));
  const otherEvidence = otherSignals.filter((signal) => signal.pattern.test(story));
  let outcome: Outcome;
  if (selfEvidence.length >= 1 && otherEvidence.length === 0) outcome = "패소";
  else if (selfEvidence.length >= 1 && otherEvidence.length >= 1) outcome = "쌍방 과실";
  else if (otherEvidence.length >= 2) outcome = "승소";
  else if (otherEvidence.length === 1) outcome = "일부 승소";
  else outcome = "증거 불충분";

  const ranges: Record<Outcome, [number, number]> = {
    승소: [88, 99], "일부 승소": [65, 82], "쌍방 과실": [48, 58], 패소: [18, 39], "증거 불충분": [40, 55],
  };
  const [min, max] = ranges[outcome];
  const evidence = [...selfEvidence, ...otherEvidence].map((item) => item.label);
  if (!evidence.length) evidence.push("구체적 행동 단서 부족");

  return {
    outcome,
    title: pick(titles[mood][outcome]),
    order: pick(orders[outcome]),
    reason: `${pick(reasonOpeners[outcome])} ${pick(moodClosers[mood])}`,
    compensation: pick(compensationByOutcome[outcome]),
    score: Math.floor(min + Math.random() * (max - min + 1)),
    conscience: pick(conscienceByOutcome[outcome]),
    evidence,
  };
}

function makeCaseNumber() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}${day}-${Math.floor(100 + Math.random() * 900)}`;
}

export default function CourtPage() {
  const [story, setStory] = useState("");
  const [mood, setMood] = useState<Mood>("웃기게");
  const [result, setResult] = useState<Verdict | null>(null);
  const [caseNumber, setCaseNumber] = useState("");
  const [shared, setShared] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [judgingStep, setJudgingStep] = useState(0);

  const canSubmit = story.trim().length >= 8;

  const shortStory = useMemo(() => {
    if (story.length <= 88) return story;
    return `${story.slice(0, 88)}…`;
  }, [story]);

  async function deliverVerdict(event?: FormEvent) {
    event?.preventDefault();
    if (!canSubmit || isJudging) return;
    setIsJudging(true);
    setResult(null);
    setJudgingStep(0);
    window.setTimeout(() => {
      document.getElementById("ai-judging")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);

    for (let step = 1; step < judgingMessages.length; step += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 620));
      setJudgingStep(step);
    }
    await new Promise((resolve) => window.setTimeout(resolve, 520));

    const nextResult = buildVerdict(story.trim(), mood);
    const nextCaseNumber = makeCaseNumber();
    setResult(nextResult);
    setCaseNumber(nextCaseNumber);
    setShared(false);
    const savedVerdict: SavedVerdict = {
      id: `${Date.now()}-${nextCaseNumber}`,
      caseNumber: nextCaseNumber,
      story: story.trim(),
      title: nextResult.title,
      order: nextResult.order,
      mood,
      score: nextResult.score,
      outcome: nextResult.outcome,
      date: new Date().toISOString(),
    };
    try {
      const current = JSON.parse(window.localStorage.getItem(archiveKey) || "[]") as SavedVerdict[];
      window.localStorage.setItem(archiveKey, JSON.stringify([savedVerdict, ...current].slice(0, 50)));
    } catch {
      // 저장 공간을 사용할 수 없어도 판결 자체는 계속 진행합니다.
    }
    setIsJudging(false);
    window.setTimeout(() => {
      document.getElementById("verdict")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 40);
  }

  async function shareVerdict() {
    if (!result) return;
    const text = `내 편 판결소 판결 · ${result.outcome}\n“${shortStory}”\n\n${result.title}\n주문: ${result.order}`;
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
        <div className="court-account">
          <span className="open-status"><i /> 오늘도 재판 중</span>
          <Link className="archive-link" href="/archive">판결 보관소</Link>
          <Link href="/login">로그아웃</Link>
        </div>
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
              onChange={(event) => setStory(event.target.value)}
              placeholder="예: 팀장님이 퇴근 5분 전에 일을 주셨어요... 길어도 괜찮으니 편하게 들려주세요."
              rows={7}
              aria-describedby="story-help"
            />
            <span id="story-help" className="count">
              {story.length.toLocaleString()}자 · 제한 없음
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

          <button className="primary-button" disabled={!canSubmit || isJudging} type="submit">
            <span>{isJudging ? "AI 재판부 심리 중..." : "판결 받아보기"}</span><b>→</b>
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
        <small>판결 결과는 이 기기의 판결 보관소에만 저장돼요.</small>
      </section>

      {isJudging && (
        <section className="ai-judging" id="ai-judging" aria-live="polite" aria-busy="true">
          <div className={`ai-character ai-character-step-${judgingStep}`} aria-hidden="true">
            <div className="ai-speech">
              {judgingStep === 0 ? "음, 어디 보자…" : judgingStep === 1 ? "양쪽 말을 재는 중!" : judgingStep === 2 ? "재미도 놓칠 수 없지" : "판결합니다!"}
            </div>
            <img src="/ai-judge-character.png" alt="" />
            <div className="ai-scan-line" />
            <div className="ai-spark spark-one">✦</div>
            <div className="ai-spark spark-two">✧</div>
          </div>
          <span className="ai-label">AI COURT IN SESSION</span>
          <h2>{judgingMessages[judgingStep]}<i className="thinking-dots">...</i></h2>
          <div className="judging-progress" aria-hidden="true">
            {judgingMessages.map((message, index) => <i key={message} className={index <= judgingStep ? "active" : ""} />)}
          </div>
          <p>잠시만요. 편들어 판사가 사건의 균형을 맞추고 있어요.</p>
          <small>현재는 프론트엔드 판결 규칙을 활용한 AI 콘셉트 연출입니다.</small>
        </section>
      )}

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
            <div className={`stamp outcome-${result.outcome.replace(" ", "-")}`} aria-label={`판결 결과 ${result.outcome}`}>
              {result.outcome === "증거 불충분" ? <><span>증거</span><span>불충분</span></> : result.outcome.split(" ").map((word) => <span key={word}>{word}</span>)}
            </div>
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

            <div className="evidence-row">
              <span>판단 근거</span>
              <div>{result.evidence.map((item) => <b key={item}>{item}</b>)}</div>
            </div>

            <div className="verdict-stats">
              <div><span>원고 주장 인정</span><strong>{result.score}%</strong></div>
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
