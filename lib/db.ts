import { promises as fs } from "node:fs";
import path from "node:path";
import type { Member } from "@/lib/strengths";

// 저장소: Upstash Redis (Vercel 마켓플레이스) — 참여자 전체를 해시 하나에 저장해
// 지도 한 번 불러올 때 명령 1회만 씁니다.
// 로컬 개발에서 Redis 환경 변수가 없으면 .data/members.json 파일에 저장합니다.

const HASH = "strength-workshop:members";
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const LOCAL = !URL_ && process.env.NODE_ENV !== "production";
const LOCAL_FILE = path.join(process.cwd(), ".data", "members.json");

export class StoreNotConfigured extends Error {}

async function redis<T>(command: (string | number)[]): Promise<T> {
  if (!URL_ || !TOKEN) throw new StoreNotConfigured("Redis 저장소가 연결되지 않았습니다.");
  const res = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || `Redis ${res.status}`);
  return data.result as T;
}

async function readLocal(): Promise<Record<string, Member>> {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return {};
  }
}
async function writeLocal(all: Record<string, Member>) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(all));
}

export async function saveMember(m: Member) {
  if (LOCAL) {
    const all = await readLocal();
    all[m.id] = m;
    return writeLocal(all);
  }
  await redis(["HSET", HASH, m.id, JSON.stringify(m)]);
}

export async function getMember(id: string): Promise<Member | null> {
  if (LOCAL) return (await readLocal())[id] ?? null;
  const v = await redis<string | null>(["HGET", HASH, id]);
  return v ? (JSON.parse(v) as Member) : null;
}

export async function listMembers(): Promise<Member[]> {
  if (LOCAL) return Object.values(await readLocal());
  // HGETALL 결과: [field, value, field, value, ...]
  const flat = await redis<string[]>(["HGETALL", HASH]);
  const out: Member[] = [];
  for (let i = 1; i < (flat?.length ?? 0); i += 2) {
    try {
      out.push(JSON.parse(flat[i]) as Member);
    } catch {}
  }
  return out;
}

export async function deleteMember(id: string) {
  if (LOCAL) {
    const all = await readLocal();
    delete all[id];
    return writeLocal(all);
  }
  await redis(["HDEL", HASH, id]);
}
