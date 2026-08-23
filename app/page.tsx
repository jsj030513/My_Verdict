"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  function enter() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => router.push("/login"), 420);
  }

  useEffect(() => {
    const timer = window.setTimeout(enter, 3200);
    return () => window.clearTimeout(timer);
  });

  return (
    <main className={leaving ? "splash-page leaving" : "splash-page"}>
      <img
        className="splash-image"
        src="/court-splash.png"
        alt="내 편 판결소 — 그건 좀 억울했겠다"
      />
      <button className="splash-enter" type="button" onClick={enter} aria-label="로그인 화면으로 이동">
        <span>판결소 입장하기</span><b>→</b>
      </button>
      <div className="splash-progress" aria-hidden="true"><i /></div>
    </main>
  );
}
