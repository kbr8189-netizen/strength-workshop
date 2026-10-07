"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, LogOut, Maximize2, Minimize2, RefreshCw, Trash2 } from "lucide-react";
import StrengthMap from "@/components/StrengthMap";
import { GROUPS, STRENGTH_BY_KEY, WORKSHOP, type Member } from "@/lib/strengths";

type View = "map" | "list";
const btn = "rounded-xl border-2 font-bold shadow-sm transition";
const btnOn = "border-blue-700 bg-blue-700 text-white";
const btnOff = "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700";

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const byGroup = (a: Member, b: Member) =>
  GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.name.localeCompare(b.name, "ko");

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(true);
  const [view, setView] = useState<View>("map");
  const [big, setBig] = useState(false);
  const [filter, setFilter] = useState("전체");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/data", { cache: "no-store" }).catch(() => null);
    if (res?.status === 401) return window.location.reload();
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) setError(data.error || "불러오지 못했습니다.");
    else {
      setError("");
      setMembers([...(data.members as Member[])].sort(byGroup));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [auto, load]);

  const groups = useMemo(() => GROUPS.filter((g) => members.some((m) => m.group === g)), [members]);
  const shown = filter === "전체" ? members : members.filter((m) => m.group === filter);

  async function remove(id: string) {
    const res = await fetch(`/api/admin/data?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setConfirmId(null);
    if (res.ok) load();
    else setError("삭제하지 못했습니다.");
  }

  function downloadCsv() {
    const header = ["조", "이름", "1위", "2위", "3위", "4위", "5위", "저장 시각"];
    const rows = members.map((m) => [
      m.group,
      m.name,
      ...m.top5.map((k) => STRENGTH_BY_KEY[k]?.name ?? k),
      new Date(m.updatedAt).toLocaleString("ko-KR"),
    ]);
    const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `강점지도_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <main className={`mx-auto w-full px-4 py-6 ${big ? "max-w-[1600px]" : "max-w-6xl"}`}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold tracking-wide text-blue-700">강사 화면 · {WORKSHOP.courseTitle}</div>
          <h1 className="mt-1 text-2xl font-extrabold">{WORKSHOP.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {members.length}명 입력 · {groups.length}개 조 {loading && "· 갱신 중…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAuto(!auto)} className={`${btn} ${auto ? btnOn : btnOff} px-3 py-2 text-sm`}>
            자동 새로고침 {auto ? "켬" : "끔"}
          </button>
          <button onClick={load} className={`${btn} ${btnOff} inline-flex items-center gap-1 px-3 py-2 text-sm`}>
            <RefreshCw className="h-4 w-4" /> 새로고침
          </button>
          <button onClick={downloadCsv} className={`${btn} ${btnOff} inline-flex items-center gap-1 px-3 py-2 text-sm`}>
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={logout} className={`${btn} ${btnOff} inline-flex items-center gap-1 px-3 py-2 text-sm`}>
            <LogOut className="h-4 w-4" /> 로그아웃
          </button>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setView("map")} className={`${btn} ${view === "map" ? btnOn : btnOff} px-4 py-2 text-sm`}>
            강점지도
          </button>
          <button onClick={() => setView("list")} className={`${btn} ${view === "list" ? btnOn : btnOff} px-4 py-2 text-sm`}>
            입력 현황
          </button>
          {view === "map" && (
            <button onClick={() => setBig(!big)} className={`${btn} ${btnOff} inline-flex items-center gap-1 px-3 py-2 text-sm`}>
              {big ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />} {big ? "기본 크기" : "크게 보기"}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["전체", ...groups].map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`rounded-full border px-3 py-1 text-sm font-bold ${
                filter === g ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 text-sm font-bold text-rose-600">{error}</div>}

      {view === "map" ? (
        <StrengthMap key={filter} members={shown} big={big} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">조</th>
                <th className="px-3 py-2">이름</th>
                <th className="px-3 py-2">대표강점 1~5위</th>
                <th className="px-3 py-2">저장 시각</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="whitespace-nowrap px-3 py-2">{m.group}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-bold">{m.name}</td>
                  <td className="px-3 py-2">{m.top5.map((k) => STRENGTH_BY_KEY[k]?.name ?? k).join(" · ")}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                    {new Date(m.updatedAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    {confirmId === m.id ? (
                      <span className="inline-flex gap-1">
                        <button onClick={() => remove(m.id)} className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white">
                          삭제
                        </button>
                        <button onClick={() => setConfirmId(null)} className="rounded-lg border px-2 py-1 text-xs">
                          취소
                        </button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmId(m.id)} aria-label={`${m.name} 삭제`} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!shown.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    아직 입력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
