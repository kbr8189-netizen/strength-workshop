import { MEMBER_PREFIX } from "@/lib/keys";
import { listJson } from "@/lib/store";
import type { MapMember, Member } from "@/lib/strengths";

export const dynamic = "force-dynamic";

// 팀 강점지도용 공개 데이터 (이름·조·대표강점만)
export async function GET() {
  try {
    const all = await listJson<Member>(MEMBER_PREFIX);
    const members: MapMember[] = all
      .map(({ name, group, top5, updatedAt }) => ({ name, group, top5, updatedAt }))
      .sort((a, b) => a.group.localeCompare(b.group, "ko", { numeric: true }) || a.name.localeCompare(b.name, "ko"));
    return Response.json({ members });
  } catch (e) {
    console.error("map read failed", e);
    return Response.json({ error: "불러오지 못했어요." }, { status: 500 });
  }
}
