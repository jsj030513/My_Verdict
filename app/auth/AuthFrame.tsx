"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

type AuthView = "login" | "signup" | "find-id" | "forgot-password";

const viewCopy: Record<AuthView, { eyebrow: string; title: string; description: string }> = {
  login: {
    eyebrow: "재판소 입장",
    title: "다시 만나서\n반가워요.",
    description: "오늘의 억울함도 이곳에서는 혼자 참지 않아도 돼요.",
  },
  signup: {
    eyebrow: "신규 원고 등록",
    title: "당신 편을\n예약해 둘게요.",
    description: "간단한 정보만 남기면 언제든 내 편 판결소를 이용할 수 있어요.",
  },
  "find-id": {
    eyebrow: "아이디 찾기",
    title: "기억나지 않아도\n괜찮아요.",
    description: "가입할 때 입력한 이름과 이메일로 아이디를 확인해 보세요.",
  },
  "forgot-password": {
    eyebrow: "비밀번호 찾기",
    title: "새 열쇠를\n발급해 드릴게요.",
    description: "본인 확인 후 이메일로 비밀번호 재설정 안내를 보내드려요.",
  },
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete} required />
      {hint && <small>{hint}</small>}
    </div>
  );
}

function AuthShell({ view, children }: { view: AuthView; children: ReactNode }) {
  const copy = viewCopy[view];
  return (
    <main className="auth-main">
      <section className="auth-story" aria-label="내 편 판결소 소개">
        <Link className="auth-brand" href="/login" aria-label="내 편 판결소 로그인">
          <span className="brand-mark auth-mark">내편</span>
          <strong>내 편 판결소</strong>
        </Link>
        <div className="auth-story-copy">
          <span>{copy.eyebrow}</span>
          <h1>{copy.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{copy.description}</p>
        </div>
        <blockquote>“해결은 못 해도, 당신 편은 되어드릴게요.”</blockquote>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}

export function LoginView() {
  const router = useRouter();
  const [notice, setNotice] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("확인되었습니다. 판결소로 입장합니다.");
    window.setTimeout(() => router.push("/court"), 500);
  }

  return (
    <AuthShell view="login">
      <div className="auth-form-wrap">
        <div className="auth-form-heading">
          <span>WELCOME BACK</span>
          <h2>로그인</h2>
          <p>내 편이 필요한 순간, 언제든 돌아오세요.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <Field id="username" label="아이디" placeholder="아이디를 입력해 주세요" autoComplete="username" />
          <Field id="password" label="비밀번호" type="password" placeholder="비밀번호를 입력해 주세요" autoComplete="current-password" />
          <label className="remember-row">
            <input type="checkbox" name="remember" />
            <span>아이디 기억하기</span>
          </label>
          <button className="auth-primary" type="submit">판결소 입장하기 <b>→</b></button>
          {notice && <p className="auth-notice" role="status">{notice}</p>}
        </form>
        <nav className="auth-links" aria-label="계정 메뉴">
          <Link href="/signup">회원가입</Link>
          <Link href="/find-id">아이디 찾기</Link>
          <Link href="/forgot-password">비밀번호 찾기</Link>
        </nav>
        <p className="prototype-note">현재는 프론트엔드 확인 단계로, 어떤 값으로도 입장할 수 있어요.</p>
      </div>
    </AuthShell>
  );
}

export function SignupView() {
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("new-password") !== form.get("confirm-password")) {
      setError("비밀번호가 서로 일치하지 않아요.");
      return;
    }
    setError("");
    setComplete(true);
  }

  return (
    <AuthShell view="signup">
      <div className="auth-form-wrap auth-form-wide">
        {!complete ? (
          <>
            <div className="auth-form-heading">
              <span>JOIN THE COURT</span>
              <h2>회원가입</h2>
              <p>나만의 사건 기록을 위한 기본 정보를 입력해 주세요.</p>
            </div>
            <form className="auth-form" onSubmit={submit}>
              <div className="field-grid">
                <Field id="name" label="이름" placeholder="이름" autoComplete="name" />
                <Field id="new-username" label="아이디" placeholder="영문·숫자 4자 이상" autoComplete="username" />
              </div>
              <Field id="email" label="이메일" type="email" placeholder="example@email.com" autoComplete="email" />
              <Field id="new-password" label="비밀번호" type="password" placeholder="영문·숫자 포함 8자 이상" autoComplete="new-password" />
              <Field id="confirm-password" label="비밀번호 확인" type="password" placeholder="비밀번호를 한 번 더 입력해 주세요" autoComplete="new-password" />
              <label className="terms-row">
                <input type="checkbox" required />
                <span><b>[필수]</b> 이용약관 및 개인정보 처리방침에 동의합니다.</span>
              </label>
              <button className="auth-primary" type="submit">내 편 등록하기 <b>→</b></button>
              {error && <p className="auth-error" role="alert">{error}</p>}
            </form>
            <p className="auth-return">이미 계정이 있나요? <Link href="/login">로그인</Link></p>
          </>
        ) : (
          <div className="auth-complete">
            <span className="complete-stamp">등록<br />완료</span>
            <h2>이제 우리가<br />당신 편이에요.</h2>
            <p>회원가입 화면 확인이 완료되었습니다.<br />백엔드 연결 후 실제 계정이 생성돼요.</p>
            <Link className="auth-primary" href="/login">로그인하러 가기 <b>→</b></Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export function FindIdView() {
  const [result, setResult] = useState(false);
  return (
    <AuthShell view="find-id">
      <div className="auth-form-wrap">
        <div className="auth-form-heading">
          <span>FIND YOUR ID</span>
          <h2>아이디 찾기</h2>
          <p>회원정보와 일치하는 아이디를 확인해 드려요.</p>
        </div>
        {!result ? (
          <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setResult(true); }}>
            <Field id="find-name" label="이름" placeholder="가입 시 입력한 이름" autoComplete="name" />
            <Field id="find-email" label="이메일" type="email" placeholder="가입 시 입력한 이메일" autoComplete="email" />
            <button className="auth-primary" type="submit">아이디 확인하기 <b>→</b></button>
          </form>
        ) : (
          <div className="find-result" role="status">
            <span>확인된 아이디</span>
            <strong>myv****</strong>
            <small>실제 아이디 조회는 백엔드 연결 후 동작합니다.</small>
          </div>
        )}
        <div className="auth-bottom-actions">
          <Link href="/login">로그인으로 돌아가기</Link>
          <Link href="/forgot-password">비밀번호도 찾기</Link>
        </div>
      </div>
    </AuthShell>
  );
}

export function ForgotPasswordView() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell view="forgot-password">
      <div className="auth-form-wrap">
        <div className="auth-form-heading">
          <span>RESET PASSWORD</span>
          <h2>비밀번호 찾기</h2>
          <p>확인 후 재설정 안내를 받을 이메일을 입력해 주세요.</p>
        </div>
        {!sent ? (
          <form className="auth-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
            <Field id="reset-username" label="아이디" placeholder="가입한 아이디" autoComplete="username" />
            <Field id="reset-email" label="이메일" type="email" placeholder="가입 시 입력한 이메일" autoComplete="email" />
            <button className="auth-primary" type="submit">재설정 안내 받기 <b>→</b></button>
          </form>
        ) : (
          <div className="find-result sent-result" role="status">
            <span>안내 준비 완료</span>
            <strong>이메일을 확인해 주세요</strong>
            <small>백엔드 연결 후 실제 재설정 메일이 발송됩니다.</small>
          </div>
        )}
        <div className="auth-bottom-actions">
          <Link href="/login">로그인으로 돌아가기</Link>
          <Link href="/find-id">아이디 먼저 찾기</Link>
        </div>
      </div>
    </AuthShell>
  );
}
