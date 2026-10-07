const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 다른 워크숍 앱과 같은 Blob 스토어를 써도 섞이지 않도록 앱 전용 폴더 사용
export const MEMBER_PREFIX = "strength-workshop/member/";

export function memberKey(id: string) {
  return UUID.test(id) ? `${MEMBER_PREFIX}${id}.json` : null;
}
