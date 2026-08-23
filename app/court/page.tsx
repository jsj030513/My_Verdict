"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  genre: string;
  judgeComment: string;
  entertainmentLabel: string;
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

const moods: Mood[] = ["다정하게", "단호하게", "웃기게"];
const judgingMessages = [
  "사건에서 웃음 포인트 압수수색 중",
  "양심과 눈치의 알리바이를 대조하는 중",
  "판결문에 드립을 합법적으로 첨가 중",
  "판결봉 대신 웃음 버튼을 두드리는 중",
];

const samples = [
  "친구가 내 디저트를 한입만 먹는다더니 반을 먹었어요.",
  "팀장님이 퇴근 5분 전에 일을 주셨어요.",
  "애인이 제 메시지는 안 보고 릴스만 보내요.",
];

const titles: Record<Mood, Record<Outcome, string[]>> = {
  다정하게: {
    승소: ["당신의 서운함은 충분히 타당합니다", "마음의 손을 들어드립니다", "참아온 마음에 승소를 선고합니다", "오늘만큼은 삐져도 무죄입니다", "당신의 마음에 따뜻한 승소 도장을 찍습니다"],
    "일부 승소": ["서운함은 인정, 오해는 조금 덜어냅니다", "당신 마음의 절반 이상은 옳았습니다", "섭섭할 이유가 충분했습니다"],
    "쌍방 과실": ["두 마음 모두 잠깐 길을 잃었습니다", "서로에게 한 걸음씩 필요합니다", "이번 사건은 함께 풀어야 합니다"],
    패소: ["이번만큼은 상대의 마음도 살펴봅니다", "서운함과 잘못은 별개의 문제입니다", "따뜻하지만 솔직한 패소입니다", "마음은 이해하지만 판결봉은 반대편입니다", "괜찮아요, 오늘의 머쓱함도 추억이 됩니다"],
    "증거 불충분": ["마음은 들었지만 사실이 조금 더 필요합니다", "아직 판결봉을 내려놓겠습니다", "서둘러 단정하지 않기로 합니다"],
  },
  단호하게: {
    승소: ["선 넘음이 명백합니다", "참을 만큼 참았습니다", "피고의 책임이 분명합니다", "이건 눈치 결석으로 유죄입니다", "변명의 문은 지금 닫혔습니다"],
    "일부 승소": ["억울함은 인정하되 전부는 아닙니다", "피고에게 더 큰 책임이 있습니다", "원고의 주장을 일부 받아들입니다"],
    "쌍방 과실": ["양측 모두 반성문을 제출하십시오", "누구도 완전히 자유롭지 않습니다", "서로 한 번씩 선을 넘었습니다"],
    패소: ["이번 사건은 원고 패소입니다", "솔직히 이번에는 당신 잘못입니다", "편은 들지만 판결은 냉정합니다", "원고의 양심에게 출석을 명합니다", "오늘의 빌런, 설마 당신이었습니다"],
    "증거 불충분": ["주장만으로는 판결할 수 없습니다", "정황은 있으나 결정타가 없습니다", "추가 진술을 명합니다"],
  },
  웃기게: {
    승소: ["유죄. 꽤나 유죄.", "피고의 양심에 로그인이 필요합니다", "원고 승. 이의 제기는 간식으로만 받습니다", "피고의 눈치가 로그아웃했습니다", "이 정도면 서운함도 정규직입니다", "피고 측 변명 서버가 폭발했습니다"],
    "일부 승소": ["반쯤 유죄, 간식은 온전히 배상", "원고 우세 판정승입니다", "억울함 7, 오해 3으로 판결합니다", "승소는 미니, 생색은 맥시입니다", "완승은 아니지만 자랑은 가능합니다"],
    "쌍방 과실": ["둘 다 유죄, 둘 다 귀여운 벌금형", "쌍방의 눈치가 비행기 모드였습니다", "이번 싸움의 승자는 배달앱뿐입니다", "두 분 다 양심 업데이트가 필요합니다", "피고도 원고도 도긴개긴 월드컵 결승입니다"],
    패소: ["원고의 양심도 출석해 주세요", "반전입니다. 이번 피고는 당신입니다", "편들기 실패. 증거가 너무 솔직했습니다", "내 편 서비스도 이건 못 막습니다", "판결봉이 조용히 당신을 가리킵니다", "오늘의 반전 주인공은 원고입니다"],
    "증거 불충분": ["재판부도 눈치만 보는 중입니다", "사건이 너무 짧아 판결봉이 멈췄습니다", "목격자 한 명 또는 카톡 세 줄을 요청합니다", "판사도 궁금해서 다음 화를 기다립니다", "증거가 숨바꼭질 국가대표입니다"],
  },
};

const orders: Record<Outcome, string[]> = {
  승소: ["피고는 진심 어린 사과와 원고가 고른 간식 1회를 지급할 것.", "피고는 다음 약속의 선택권을 원고에게 양도할 것.", "피고는 변명 없이 ‘그건 내가 미안해’를 먼저 말할 것.", "피고는 원고의 생색 3회를 웃는 얼굴로 견딜 것.", "피고는 배달비까지 포함한 화해 디저트를 상납할 것.", "피고의 이의 신청은 커피와 함께 제출할 때만 접수할 것."],
  "일부 승소": ["피고는 사과하고, 원고도 오해한 부분 한 가지를 인정할 것.", "피고 70%, 원고 30%의 비율로 화해 비용을 부담할 것.", "두 사람은 각자 한 문장씩만 해명한 뒤 메뉴 선택권을 원고에게 줄 것.", "원고는 7할만 의기양양할 수 있으며 과도한 세리머니는 금지할 것.", "피고는 디저트를 사고 원고는 ‘내가 다 맞진 않았네’를 아주 작게 말할 것."],
  "쌍방 과실": ["양측은 반성 간식비를 절반씩 부담하고 먼저 웃는 쪽이 이길 것.", "서로의 잘못 하나씩만 인정하고 오늘의 논쟁을 종료할 것.", "양측 모두 사과문 대신 커피 두 잔을 들고 대화할 것.", "두 사람은 동시에 ‘내가 좀 그랬다’를 외친 뒤 화해할 것.", "쌍방 모두 단톡방 여론전을 멈추고 떡볶이 앞에서 휴전할 것."],
  패소: ["원고는 쿨하게 잘못을 인정하고 작은 사과를 먼저 건넬 것.", "원고는 변명 24시간 금지 및 다음 약속 배려형에 처할 것.", "원고는 피고에게 사과하고 본인 몫의 간식을 직접 조달할 것.", "원고는 ‘설마 내가?’ 표정을 거두고 양심 업데이트를 설치할 것.", "원고는 오늘 하루 생색 금지 및 머쓱한 웃음 2회에 처할 것."],
  "증거 불충분": ["원고는 누가, 언제, 무엇을 했는지 보강하여 재접수할 것.", "판결을 보류하고 구체적인 대화 한 줄을 추가 제출할 것.", "양측은 섣부른 유죄 추정 없이 추가 진술을 준비할 것.", "원고는 카톡 세 줄 또는 목격자 한 명을 데리고 시즌 2로 돌아올 것.", "본 사건은 예고편만 공개되었으므로 다음 화까지 판결봉을 충전할 것."],
};

const reasonOpeners: Record<Outcome, string[]> = {
  승소: ["상대의 반복된 무시 또는 약속 위반 정황이 확인되었습니다.", "진술 속 배려의 불균형이 원고에게 일방적으로 기울어 있습니다.", "원고가 감당한 불편에 비해 피고의 설명이 충분하지 않습니다."],
  "일부 승소": ["서운함의 원인은 분명하지만 양쪽 사정이 함께 보입니다.", "피고의 책임이 더 크지만 원고의 표현에도 아쉬움이 남습니다.", "원고의 감정은 타당하나 모든 책임을 상대에게 묻기는 어렵습니다."],
  "쌍방 과실": ["진술에서 양측의 실수와 감정적인 대응이 동시에 확인되었습니다.", "누가 먼저였는지보다 서로의 배려가 동시에 부족했던 사건입니다.", "한쪽만 탓하면 다음 재판이 너무 빨리 열릴 가능성이 큽니다."],
  패소: ["원고가 먼저 약속을 어기거나 잘못을 인정한 정황이 더 강합니다.", "속상한 마음과 별개로 이번 행동의 책임은 원고에게 있습니다.", "재판부는 편들기보다 솔직한 사과가 더 도움이 된다고 판단했습니다."],
  "증거 불충분": ["현재 진술만으로는 누구의 책임이 더 큰지 가르기 어렵습니다.", "감정은 충분히 전달됐지만 사건의 행동과 순서가 아직 모호합니다.", "억울함의 크기보다 구체적인 사실 한두 가지가 더 필요합니다."],
};

const moodClosers: Record<Mood, string[]> = {
  다정하게: ["마음은 토닥이고, 억울함은 간식으로 조용히 입막음하겠습니다.", "오늘의 감정은 무죄이며 귀여운 투정 1회도 허가합니다.", "누가 이기느냐보다 일단 따뜻한 거 먹는 쪽을 권고합니다.", "재판부는 원고의 마음에 담요 한 장을 증거물로 제출합니다."],
  단호하게: ["사과 없는 변명은 재판부의 귀에 자동 음소거됩니다.", "배려는 선택 옵션이 아니라 기본 설치 앱입니다.", "같은 일이 반복되면 다음 판결에는 간식 이자가 붙습니다.", "눈치 미탑재는 감형 사유가 아니라 업데이트 대상입니다."],
  웃기게: ["본 재판부는 양심의 와이파이 상태까지 면밀히 살폈습니다.", "다음 사건 접수 전 간식 합의서 작성을 강력히 권고합니다.", "단, 배고픈 상태의 항소는 모두 기각합니다.", "재판부 전원이 웃음을 참지 못해 잠시 휴정했습니다.", "이 사건은 단톡방 배심원에게 넘기면 3시간은 불탈 사안입니다.", "억울함은 인정되나 흑역사 보존 기간은 최소 3년입니다."],
};

type CaseGenre = "먹거리" | "연락" | "직장" | "약속" | "연애" | "생활" | "미스터리";

const genreRules: { genre: CaseGenre; pattern: RegExp }[] = [
  { genre: "먹거리", pattern: /(먹|밥|커피|디저트|간식|치킨|피자|케이크|한입|메뉴|배달)/ },
  { genre: "연락", pattern: /(연락|답장|카톡|메시지|읽씹|안읽씹|전화|릴스|디엠|DM)/i },
  { genre: "직장", pattern: /(회사|팀장|상사|동료|퇴근|야근|회의|업무|일을|출근)/ },
  { genre: "약속", pattern: /(약속|늦|지각|취소|기다|시간|예약)/ },
  { genre: "연애", pattern: /(애인|남친|여친|썸|데이트|기념일|사랑|커플)/ },
  { genre: "생활", pattern: /(청소|설거지|빨래|룸메|남편|아내|가족|집|화장실)/ },
];

const genreComments: Record<CaseGenre, string[]> = {
  먹거리: ["‘한입만’의 법적 단위는 결코 반쪽이 아닙니다.", "음식 앞에서 드러난 본성은 포토샵으로도 지워지지 않습니다.", "재판부는 마지막 한 조각의 소유권을 매우 엄중히 봅니다."],
  연락: ["휴대폰 배터리는 살아 있는데 답장만 사망한 점이 수상합니다.", "릴스 전송 능력과 답장 능력은 같은 손가락에서 나옵니다.", "읽씹은 짧지만 기다림은 장편 드라마였습니다."],
  직장: ["퇴근 5분 전 업무 투척은 시간의 평화를 해치는 행위입니다.", "재판부 달력에는 ‘급한 일’이 어제부터 표시되어 있었습니다.", "월급에는 텔레파시 수당이 포함되어 있지 않습니다."],
  약속: ["‘거의 다 왔어’가 아직 침대 위였다는 제보가 들어왔습니다.", "기다린 사람의 10분은 늦은 사람의 30분보다 깁니다.", "시간 약속은 고무줄이 아니므로 무한정 늘어나지 않습니다."],
  연애: ["사랑은 자유지만 눈치는 필수 선택 과목입니다.", "기념일 기억장치는 선택이 아니라 기본 사양입니다.", "서운함을 자동 저장한 원고의 마음이 용량 초과 직전입니다."],
  생활: ["집안일은 요정이 아니라 사람이 한다는 사실을 확인합니다.", "보이지 않는다고 사라진 것이 아니라 누군가 치운 것입니다.", "재판부는 휴지심 방치를 생활계의 미제 사건으로 분류합니다."],
  미스터리: ["사건의 장르는 아직 미스터리지만 억울함의 존재는 확인됩니다.", "진술이 예측 불가라 재판부의 안경이 잠시 흐려졌습니다.", "이 사건은 단톡방에 올리면 장르가 즉시 코미디로 바뀔 가능성이 큽니다."],
};

const entertainmentLabels: Record<Outcome, string[]> = {
  승소: ["오늘의 당당함 면허 발급", "단톡방 자랑 허가", "억울함 완전 방전"],
  "일부 승소": ["소소한 생색 허용", "판정승 세리머니 가능", "억울함 부분 환불"],
  "쌍방 과실": ["둘 다 반성 의자행", "화해 간식 공동구매", "도긴개긴 인증 완료"],
  패소: ["머쓱함 1일 이용권", "사과 타이밍 포착", "흑역사 자동 저장"],
  "증거 불충분": ["다음 화 예고편", "카톡 캡처 소환", "판결봉 일시정지"],
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
  { pattern: /(미안|사과해야|괜히|과했|심했|참지 못|욱해서)/, label: "원고의 양심 자진 출석" },
];
const otherSignals = [
  { pattern: /(친구|애인|남친|여친|팀장|상사|동료|남편|아내|상대).*(무시|늦|먹|욕|막말|거짓말|취소|잠수|안 보|일을 주|소리)/, label: "상대의 문제 행동" },
  { pattern: /(반복|맨날|항상|또 |매번)/, label: "반복된 행동" },
  { pattern: /(약속을 어|연락 안|답장 안|말도 없이|허락 없이|반을 먹|퇴근.*일)/, label: "약속·배려 위반" },
  { pattern: /(읽씹|안읽씹|지각|새치기|뺏|훔|놀렸|비꼬|무례|떠넘|강요|차별)/, label: "눈치·배려 실종" },
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
  const genre = genreRules.find((rule) => rule.pattern.test(story))?.genre || "미스터리";

  return {
    outcome,
    title: pick(titles[mood][outcome]),
    order: pick(orders[outcome]),
    reason: `${pick(reasonOpeners[outcome])} ${pick(moodClosers[mood])}`,
    compensation: pick(compensationByOutcome[outcome]),
    score: Math.floor(min + Math.random() * (max - min + 1)),
    conscience: pick(conscienceByOutcome[outcome]),
    evidence,
    genre,
    judgeComment: pick(genreComments[genre]),
    entertainmentLabel: pick(entertainmentLabels[outcome]),
  };
}

function makeCaseNumber() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}${day}-${Math.floor(100 + Math.random() * 900)}`;
}

export default function CourtPage() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [mood, setMood] = useState<Mood>("웃기게");
  const [result, setResult] = useState<Verdict | null>(null);
  const [caseNumber, setCaseNumber] = useState("");
  const [shared, setShared] = useState(false);
  const [isJudging, setIsJudging] = useState(false);
  const [judgingStep, setJudgingStep] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) {
        router.replace("/login");
        return;
      }
      const data = await response.json() as { user: { name: string } };
      setUserName(data.user.name);
    });
  }, [router]);

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
    const saveResponse = await fetch("/api/verdicts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(savedVerdict),
    });
    if (saveResponse.status === 401) router.replace("/login");
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

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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
          {userName && <span className="court-user">{userName} 님</span>}
          <Link className="archive-link" href="/archive">판결 보관소</Link>
          <button type="button" onClick={logout}>로그아웃</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span>⚖</span> 법적 효력 0% · 과몰입 100%</div>
        <h1>그건 좀<br /><em>억울했겠다.</em></h1>
        <p className="hero-copy">
          진지한 고민은 잠시 내려놓고,<br />오늘의 사소한 억울함을 예능 판결로 날려버려요.
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
            <legend>오늘의 예능 재판부</legend>
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
                  <span>{item === "다정하게" ? "말랑한 편들기" : item === "단호하게" ? "웃픈 현실 체크" : "드립 과다 투여"}</span>
                  <strong>{item === "다정하게" ? "포근 판사" : item === "단호하게" ? "팩폭 판사" : "예능 판사"}</strong>
                </label>
              ))}
            </div>
          </fieldset>

          <button className="primary-button" disabled={!canSubmit || isJudging} type="submit">
            <span>{isJudging ? "예능 재판부 과몰입 중..." : "웃긴 판결 받아보기"}</span><b>→</b>
          </button>
          <p className="entertainment-notice"><b>재미 전용</b> 실제 분쟁 해결이나 법률 판단 대신, 친구들과 웃고 공유할 가벼운 사건만 접수해 주세요.</p>
          {!canSubmit && story.length > 0 && <p className="form-hint">조금만 더 자세히 들려주세요.</p>}
        </form>
      </section>

      <section className="promise">
        <p>예능 재판부의 철칙</p>
        <div>
          <span>하나.</span>
          <strong>사건은 사소해도<br />과몰입은 진심입니다.</strong>
        </div>
        <div>
          <span>둘.</span>
          <strong>정답을 주기보다<br />웃고 공유할 판결을 만듭니다.</strong>
        </div>
        <small>오직 재미와 위로를 위한 콘텐츠예요. 실제 법률·의료·안전 문제의 판단에는 사용할 수 없습니다.</small>
      </section>

      {isJudging && (
        <section className="ai-judging" id="ai-judging" aria-live="polite" aria-busy="true">
          <div className={`ai-character ai-character-step-${judgingStep}`} aria-hidden="true">
            <div className="ai-speech">
              {judgingStep === 0 ? "오늘도 큰 사건이군…" : judgingStep === 1 ? "눈치의 알리바이 확인!" : judgingStep === 2 ? "드립 한 스푼? 두 스푼!" : "탕! 웃음형 선고!"}
            </div>
            <img src="/ai-judge-character.png" alt="" />
            <div className="ai-scan-line" />
            <div className="ai-spark spark-one">✦</div>
            <div className="ai-spark spark-two">✧</div>
          </div>
          <span className="ai-label">COMEDY COURT IN SESSION</span>
          <h2>{judgingMessages[judgingStep]}<i className="thinking-dots">...</i></h2>
          <div className="judging-progress" aria-hidden="true">
            {judgingMessages.map((message, index) => <i key={message} className={index <= judgingStep ? "active" : ""} />)}
          </div>
          <p>잠시만요. 편들어 판사가 사건을 예능으로 재구성하고 있어요.</p>
          <small>결과는 오락용 자동 생성 콘텐츠이며 실제 사실 판단이나 조언이 아닙니다.</small>
        </section>
      )}

      {result && (
        <section className="result-section" id="verdict" aria-live="polite">
          <div className="result-heading">
            <span>법적 효력 0% · 공유 재미 100%</span>
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
            <div className="case-genre">{result.genre} 사건 전담부</div>
            <h3>{result.title}</h3>

            <div className="ruling">
              <span>주문</span>
              <p>{result.order}</p>
            </div>

            <div className="reason">
              <span>판결 이유</span>
              <p>{result.reason}</p>
            </div>

            <div className="judge-aside">
              <span>판사의 사족</span>
              <p>“{result.judgeComment}”</p>
            </div>

            <div className="evidence-row">
              <span>판단 근거</span>
              <div>{result.evidence.map((item) => <b key={item}>{item}</b>)}</div>
            </div>

            <div className="verdict-stats">
              <div><span>원고 주장 인정</span><strong>{result.score}%</strong></div>
              <div><span>예능 위자료</span><strong>{result.compensation}</strong></div>
              <div><span>오늘의 부가형</span><strong>{result.entertainmentLabel}</strong></div>
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
              다른 드립으로 재심 요청
            </button>
            <button className="new-case-button" type="button" onClick={resetCourt}>
              새로운 사건 접수하기
            </button>
          </div>
        </section>
      )}

      <footer>
        <span className="footer-mark">내편</span>
        <p>해결은 못 해도, 웃음은 판결해 드릴게요.</p>
        <small>본 서비스는 재미 전용입니다. 모든 판결의 법적 효력은 정확히 0%입니다.</small>
      </footer>
    </main>
  );
}
