# 우리 팀 강점지도

신입사원이 VIA 공식 사이트에서 무료 성격강점 진단을 받은 뒤, 대표강점 5개를 입력하면 팀 전체의 강점지도를 함께 보는 워크숍용 웹앱입니다. 진단 문항은 담고 있지 않습니다(진단은 viacharacter.org에서 진행).

- 교육생 화면: `/` — 진단 안내 / 내 강점 입력(이름·1~5위) / 팀 강점지도(참여자 전체, 강점 칸 누르면 해당 인원, 덕목 분포, 토론 질문)
- 강사 화면: `/admin` — 비밀번호 로그인 후 강점지도 크게 보기, 입력 현황·삭제, CSV 다운로드, 10초 자동 새로고침

## 구성

- Next.js (App Router) + TypeScript + Tailwind CSS
- 저장: Upstash Redis (Vercel 마켓플레이스, 무료 플랜) — 해시 `strength-workshop:members` 하나에 참여자 전체 저장. 지도 1회 조회 = Redis 명령 1회
- 연결 점검: `/api/health`
- 문구·강점 설명 수정: `lib/strengths.ts`

## 환경 변수 (Vercel 프로젝트 설정)

| 이름 | 설명 |
| --- | --- |
| `ADMIN_PASSWORD` | 강사 화면 비밀번호 |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis를 프로젝트에 연결하면 자동 설정 (`UPSTASH_REDIS_REST_URL`/`_TOKEN`도 인식) |

## 로컬 실행

```bash
npm install
ADMIN_PASSWORD=test npm run dev   # Redis 환경 변수가 없으면 .data/ 폴더에 저장
```
