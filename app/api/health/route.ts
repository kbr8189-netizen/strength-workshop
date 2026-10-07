import { listMembers } from "@/lib/db";

export const dynamic = "force-dynamic";

// 저장소 연결 점검: 저장된 인원 수를 읽어 봅니다.
export async function GET() {
  const redisConfigured = Boolean(
    (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
      (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
  );
  try {
    const members = await listMembers();
    return Response.json({ ok: true, redisConfigured, members: members.length });
  } catch (e) {
    const err = e as Error;
    return Response.json({ ok: false, redisConfigured, error: `${err.name}: ${err.message}` });
  }
}
