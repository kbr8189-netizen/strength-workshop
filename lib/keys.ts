const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MEMBER_PREFIX = "member/";

export function memberKey(id: string) {
  return UUID.test(id) ? `${MEMBER_PREFIX}${id}.json` : null;
}
