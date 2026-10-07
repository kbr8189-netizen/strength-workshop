import { writeJson, readJson } from "@/lib/store";

export const dynamic = "force-dynamic";

// 저장소 연결 점검: 작은 점검용 파일 하나를 덮어쓰고 다시 읽어 봅니다.
export async function GET() {
  const key = "strength-workshop/_health.json";
  const auth = {
    readWriteToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    storeId: Boolean(process.env.BLOB_STORE_ID),
    vercelEnv: process.env.VERCEL_ENV ?? null,
  };
  try {
    const at = new Date().toISOString();
    await writeJson(key, { at });
    const back = await readJson<{ at: string }>(key);
    return Response.json({ ok: back?.at === at, auth });
  } catch (e) {
    const err = e as Error;
    return Response.json({ ok: false, auth, error: `${err.name}: ${err.message}` }, { status: 500 });
  }
}
