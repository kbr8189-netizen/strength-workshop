import { isAdmin } from "@/lib/auth";
import { MEMBER_PREFIX, memberKey } from "@/lib/keys";
import { listJson, removeJson } from "@/lib/store";
import type { Member } from "@/lib/strengths";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const members = await listJson<Member>(MEMBER_PREFIX);
    return Response.json({ members });
  } catch (e) {
    console.error("admin read failed", e);
    return Response.json({ error: "불러오지 못했습니다." }, { status: 500 });
  }
}

// ?id=<member id>
export async function DELETE(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const key = memberKey(new URL(request.url).searchParams.get("id") ?? "");
  if (!key) return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  try {
    await removeJson(key);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("delete failed", e);
    return Response.json({ error: "삭제하지 못했습니다." }, { status: 500 });
  }
}
