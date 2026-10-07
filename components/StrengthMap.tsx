"use client";

import { useMemo, useState } from "react";
import {
  STRENGTHS,
  STRENGTH_BY_KEY,
  VIRTUES,
  VIRTUE_BY_KEY,
  computeStats,
  type MapMember,
} from "@/lib/strengths";

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export default function StrengthMap({
  members,
  big = false,
  highlightName,
}: {
  members: MapMember[];
  big?: boolean;
  highlightName?: string;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const st = useMemo(() => computeStats(members), [members]);
  const n = members.length;

  const ranked = [...STRENGTHS].sort((a, b) => st.count[b.key] - st.count[a.key] || a.name.localeCompare(b.name, "ko"));
  const top = ranked.filter((s) => st.count[s.key] > 0).slice(0, 3);
  const zero = STRENGTHS.filter((s) => st.count[s.key] === 0);
  const vSorted = [...VIRTUES].sort((a, b) => st.virtueScore[b.key] - st.virtueScore[a.key]);
  const selected = sel ? STRENGTH_BY_KEY[sel] : null;

  if (!n) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        아직 입력된 강점이 없어요. 첫 번째 입력이 저장되면 여기에 팀 강점지도가 그려집니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Sum k="참여 인원" v={`${n}명`} s={`대표강점 ${n * 5}개`} />
        <Sum k="가장 많은 강점" v={top[0]?.name ?? "—"} s={top.map((s) => `${s.name} ${st.count[s.key]}명`).join(" · ")} />
        <Sum k="두드러진 덕목" v={vSorted[0].name} s={`전체의 ${pct(st.virtueScore[vSorted[0].key], st.virtueTotal)}%`} />
        <Sum
          k="아무도 없는 강점"
          v={`${zero.length}개`}
          s={zero.length ? zero.slice(0, 4).map((s) => s.name).join(", ") + (zero.length > 4 ? " 외" : "") : "모든 강점이 있어요"}
        />
      </div>

      {/* 지도 */}
      <div>
        <div className={`grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 ${big ? "lg:gap-4" : ""}`}>
          {VIRTUES.map((v) => (
            <div key={v.key} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-baseline justify-between border-b-4 pb-1" style={{ borderColor: v.color }}>
                <b className={big ? "text-lg" : "text-sm"}>{v.name}</b>
                <span className="text-xs tabular-nums text-slate-500">{pct(st.virtueScore[v.key], st.virtueTotal)}%</span>
              </div>
              {STRENGTHS.filter((s) => s.virtue === v.key).map((s) => {
                const c = st.count[s.key];
                const ratio = c / st.maxCount;
                const hot = ratio >= 0.55;
                const mine = highlightName && st.holders[s.key].some((h) => h.name === highlightName);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSel(sel === s.key ? null : s.key)}
                    aria-pressed={sel === s.key}
                    className={`grid gap-0.5 rounded-xl border px-2.5 text-left transition ${big ? "min-h-20 py-3" : "min-h-14 py-2"} ${
                      sel === s.key ? "ring-2 ring-slate-900 ring-offset-1" : ""
                    } ${hot ? "border-transparent text-white" : "border-slate-200"}`}
                    style={{
                      background: c
                        ? `color-mix(in srgb, ${v.color} ${Math.round(12 + ratio * 70)}%, white)`
                        : "#f1f4f8",
                    }}
                  >
                    <span className={`font-bold leading-tight ${big ? "text-lg" : "text-sm"} ${c ? "" : "text-slate-400"}`}>
                      {s.name}
                      {mine && <span className="ml-1 text-xs font-bold">★</span>}
                    </span>
                    <span className={`text-xs tabular-nums ${hot ? "text-white/90" : "text-slate-500"}`}>{c}명</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>적음</span>
          <span className="h-2 w-28 rounded-full bg-gradient-to-r from-slate-100 to-blue-700" />
          <span>많음 · 칸을 누르면 그 강점을 가진 사람이 보여요</span>
          {highlightName && <span>· ★ 내 대표강점</span>}
        </div>
      </div>

      {selected && (
        <div
          className="rounded-2xl border border-slate-200 border-l-4 bg-white p-4"
          style={{ borderLeftColor: VIRTUE_BY_KEY[selected.virtue].color }}
        >
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-lg font-extrabold">{selected.name}</h3>
            <span className="text-sm text-slate-500">
              {VIRTUE_BY_KEY[selected.virtue].name} · {selected.desc}
            </span>
          </div>
          {st.holders[selected.key].length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {st.holders[selected.key].map((h, i) => (
                <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                  {h.group} {h.name}
                  <b className="ml-1 text-xs font-medium text-slate-500">{h.rank}위</b>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              아직 이 강점을 대표강점으로 가진 사람이 없어요. 이 역할이 필요할 때 팀은 어떻게 보완할 수 있을까요?
            </p>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 덕목 분포 */}
        <div>
          <h3 className="font-extrabold">덕목별 분포</h3>
          <p className="mt-1 text-xs text-slate-500">1위 5점 ~ 5위 1점으로 가중해 계산했어요.</p>
          <div className="mt-3 space-y-2">
            {vSorted.map((v) => {
              const p = pct(st.virtueScore[v.key], st.virtueTotal);
              return (
                <div key={v.key} className="grid grid-cols-[64px_1fr_40px] items-center gap-2 text-sm">
                  <span>{v.name}</span>
                  <div className="h-3.5 overflow-hidden rounded bg-slate-100">
                    <div className="h-full rounded" style={{ width: `${p}%`, background: v.color }} />
                  </div>
                  <span className="text-right text-xs tabular-nums text-slate-500">{p}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 토론 질문 */}
        <div>
          <h3 className="font-extrabold">워크숍 토론 질문</h3>
          <ul className="mt-3 space-y-2">
            <Q label={`강한 덕목 · ${vSorted[0].name}`} text={vSorted[0].question} />
            {top[0] && (
              <Q
                label={`공통 강점 · ${top[0].name}`}
                text={`'${top[0].name}'이(가) 우리 팀의 공통 언어입니다. 이 강점이 가장 빛났던 최근 경험을 한 사람씩 이야기해 볼까요?`}
              />
            )}
            <Q
              label={`드문 덕목 · ${vSorted[vSorted.length - 1].name}`}
              text={`'${vSorted[vSorted.length - 1].name}' 영역의 강점은 상대적으로 적어요. 이런 역할이 필요할 때 누가, 어떤 방식으로 채울 수 있을까요?`}
            />
            <Q
              label="서로 알아가기"
              text="내 대표강점 하나를 골라, 동료가 그 강점을 업무에서 활용하도록 도울 수 있는 방법을 제안해 주세요."
            />
          </ul>
        </div>
      </div>

      {/* 팀원 카드 */}
      <div>
        <h3 className="font-extrabold">팀원별 대표강점</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl border bg-white p-4 ${m.name === highlightName ? "border-blue-500" : "border-slate-200"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <b className="break-all">{m.name}</b>
                <span className="shrink-0 text-xs text-slate-500">{m.group}</span>
              </div>
              <ol className="mt-2 space-y-1">
                {m.top5.map((k, r) => {
                  const s = STRENGTH_BY_KEY[k];
                  if (!s) return null;
                  return (
                    <li key={k} className="grid grid-cols-[16px_8px_1fr] items-center gap-2 text-sm">
                      <span className="text-xs tabular-nums text-slate-400">{r + 1}</span>
                      <span className="h-2 w-2 rounded-full" style={{ background: VIRTUE_BY_KEY[s.virtue].color }} />
                      <span>{s.name}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sum({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-bold text-slate-500">{k}</div>
      <div className="mt-1 text-xl font-extrabold">{v}</div>
      <div className="mt-0.5 text-xs text-slate-500">{s}</div>
    </div>
  );
}

function Q({ label, text }: { label: string; text: string }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
      <small className="block text-xs font-bold text-slate-500">{label}</small>
      {text}
    </li>
  );
}
