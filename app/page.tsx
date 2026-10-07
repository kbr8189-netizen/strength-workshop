"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Map as MapIcon, PencilLine, RefreshCw, Compass } from "lucide-react";
import StrengthMap from "@/components/StrengthMap";
import { STRENGTHS, VIRTUES, WORKSHOP, type MapMember } from "@/lib/strengths";

type Tab = "guide" | "mine" | "map";
const TABS: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: "guide", label: "진단 안내", icon: Compass },
  { id: "mine", label: "내 강점 입력", icon: PencilLine },
  { id: "map", label: "팀 강점지도", icon: MapIcon },
];

const KEY = "via_profile_v1";
type Profile = { id?: string; name: string; top5: string[]; savedAt?: string };

function load(): Profile | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Profile) : null;
  } catch {
    return null;
  }
}
function persist(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

const btn = "rounded-xl border-2 font-bold shadow-sm transition";
const btnOn = "border-blue-700 bg-blue-700 text-white";
const btnOff = "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("guide");

  useEffect(() => {
    const p = load();
    setProfile(p);
    if (p?.savedAt) setTab("map");
    setReady(true);
  }, []);

  if (!ready) return null;

  function go(t: Tab) {
    setTab(t);
    window.scrollTo({ top: 0 });
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-5">
        <div className="text-xs font-bold tracking-wide text-blue-700">{WORKSHOP.courseTitle}</div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{WORKSHOP.title}</h1>
        <div className="mt-3 flex h-1.5 max-w-xs overflow-hidden rounded-full">
          {VIRTUES.map((v) => (
            <span key={v.key} className="flex-1" style={{ background: v.color }} />
          ))}
        </div>
      </header>

      <nav className="mb-6 grid max-w-xl grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            className={`${btn} flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-xs sm:flex-row sm:text-sm ${tab === t.id ? btnOn : btnOff}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "guide" && <Guide onNext={() => go("mine")} />}
      {tab === "mine" && (
        <Mine
          initial={profile}
          onSaved={(p) => {
            setProfile(p);
            persist(p);
            go("map");
          }}
        />
      )}
      {tab === "map" && <TeamMap profile={profile} onEdit={() => go("mine")} />}
    </main>
  );
}

function Guide({ onNext }: { onNext: () => void }) {
  const steps = [
    {
      t: "VIA 공식 사이트에서 무료 진단",
      d: "아래 버튼으로 VIA 사이트에 들어가 무료 회원가입 후 진단을 시작하세요. 언어를 한국어로 바꿀 수 있고, 15분 정도 걸립니다.",
    },
    { t: "결과에서 1~5위 강점 확인", d: "진단이 끝나면 24개 강점의 순위가 나옵니다. 화면 맨 위 1~5위가 나의 대표강점이에요." },
    { t: "이 앱에 대표강점 5개 입력", d: "'내 강점 입력' 탭에서 이름을 적고, 1위부터 5위까지 순서대로 선택해 저장합니다." },
    { t: "팀 강점지도로 대화하기", d: "'팀 강점지도' 탭에서 참여한 모든 사람의 강점 분포를 보고, 토론 질문으로 이야기를 나눠 보세요." },
  ];
  return (
    <div className="max-w-3xl space-y-4">
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 font-extrabold text-blue-700">
              {i + 1}
            </span>
            <div>
              <div className="font-bold">{s.t}</div>
              <p className="mt-0.5 text-sm text-slate-600">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <a
          href={WORKSHOP.viaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} ${btnOn} inline-flex items-center gap-2 px-5 py-3`}
        >
          VIA 진단하러 가기 <ExternalLink className="h-4 w-4" />
        </a>
        <button onClick={onNext} className={`${btn} ${btnOff} px-5 py-3`}>
          진단을 마쳤어요 → 입력하기
        </button>
      </div>
      <p className="text-xs text-slate-500">
        진단 결과는 자기이해와 팀 대화를 위한 것입니다. 좋고 나쁜 강점은 없으며, 평가나 배치에는 사용하지 않습니다.
      </p>
    </div>
  );
}

function Mine({ initial, onSaved }: { initial: Profile | null; onSaved: (p: Profile) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [top5, setTop5] = useState<string[]>(initial?.top5?.length === 5 ? initial.top5 : ["", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick(i: number, v: string) {
    setTop5((prev) => prev.map((x, j) => (j === i ? v : x)));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("이름을 입력해주세요.");
    const miss = top5.findIndex((v) => !v);
    if (miss >= 0) return setError(`${miss + 1}위 강점을 선택해주세요.`);
    setBusy(true);
    setError("");
    const res = await fetch("/api/member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: initial?.id, name: name.trim(), top5 }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res || !res.ok) return setError(data.error || "저장하지 못했어요. 인터넷 연결을 확인하고 다시 눌러주세요.");
    onSaved({ id: data.record.id, name: data.record.name, top5: data.record.top5, savedAt: data.record.updatedAt });
  }

  return (
    <form onSubmit={save} className="max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
      <label className="grid gap-1.5 text-sm font-bold">
          이름
          <input
            className="rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-blue-500"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 김하늘"
          />
        </label>

      <div className="space-y-2">
        <div className="text-sm font-bold">대표강점 (VIA 결과 1~5위 순서대로)</div>
        {top5.map((v, i) => (
          <div key={i} className="grid grid-cols-[48px_1fr] items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-bold text-slate-500">
              {i + 1}위
            </span>
            <select
              aria-label={`${i + 1}위 강점`}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-500"
              value={v}
              onChange={(e) => pick(i, e.target.value)}
            >
              <option value="">{i + 1}위 강점 선택</option>
              {VIRTUES.map((vt) => (
                <optgroup key={vt.key} label={vt.name}>
                  {STRENGTHS.filter((s) => s.virtue === vt.key).map((s) => (
                    <option key={s.key} value={s.key} disabled={top5.includes(s.key) && v !== s.key}>
                      {s.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        ))}
      </div>

      {error && <div className="text-sm font-bold text-rose-600">{error}</div>}
      <button className={`${btn} ${btnOn} w-full py-3 disabled:opacity-40`} disabled={busy}>
        {busy ? "저장 중…" : initial?.savedAt ? "수정한 내용 저장" : "저장하고 팀 강점지도 보기"}
      </button>

      <details className="text-sm">
        <summary className="cursor-pointer font-bold text-slate-600">VIA 결과의 영어 이름이 헷갈린다면</summary>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 sm:grid-cols-3">
          {EN.map(([en, ko]) => (
            <span key={en}>
              {en} → <b>{ko}</b>
            </span>
          ))}
        </div>
      </details>
    </form>
  );
}

const EN: [string, string][] = [
  ["Creativity", "창의성"], ["Curiosity", "호기심"], ["Judgment", "판단력"], ["Love of Learning", "학구열"],
  ["Perspective", "통찰력"], ["Bravery", "용감함"], ["Perseverance", "끈기"], ["Honesty", "정직"],
  ["Zest", "열정"], ["Love", "사랑"], ["Kindness", "친절"], ["Social Intelligence", "사회지능"],
  ["Teamwork", "팀워크"], ["Fairness", "공정성"], ["Leadership", "리더십"], ["Forgiveness", "용서"],
  ["Humility", "겸손"], ["Prudence", "신중함"], ["Self-Regulation", "자기조절"],
  ["Appreciation of Beauty & Excellence", "심미안"], ["Gratitude", "감사"], ["Hope", "희망"],
  ["Humor", "유머"], ["Spirituality", "영성"],
];

function TeamMap({ profile, onEdit }: { profile: Profile | null; onEdit: () => void }) {
  const [members, setMembers] = useState<MapMember[] | null>(null);
  const [error, setError] = useState("");

  const fetchMap = useCallback(async () => {
    const res = await fetch("/api/map", { cache: "no-store" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) setError(data.error || "불러오지 못했어요.");
    else {
      setError("");
      setMembers(data.members);
    }
  }, []);

  useEffect(() => {
    fetchMap();
    const t = setInterval(fetchMap, 15000);
    return () => clearInterval(t);
  }, [fetchMap]);


  return (
    <div className="space-y-5">
      {!profile?.savedAt && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
          아직 내 강점을 입력하지 않았어요. 입력하면 지도에 바로 반영됩니다.
          <button onClick={onEdit} className={`${btn} ${btnOn} px-4 py-2 text-sm`}>
            입력하기
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {members ? `지금까지 ${members.length}명이 참여했어요 · 15초마다 자동으로 갱신돼요` : ""}
        </p>
        <button onClick={fetchMap} className={`${btn} ${btnOff} inline-flex items-center gap-1.5 px-3 py-1.5 text-sm`}>
          <RefreshCw className="h-4 w-4" /> 새로고침
        </button>
      </div>
      {error && <div className="text-sm font-bold text-rose-600">{error}</div>}
      {members === null ? (
        <div className="py-10 text-center text-slate-500">불러오는 중…</div>
      ) : (
        <StrengthMap members={members} highlightName={profile?.savedAt ? profile.name : undefined} />
      )}
    </div>
  );
}
