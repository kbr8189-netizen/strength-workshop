// 워크숍 정보와 강점 분류는 이 파일만 바꾸면 됩니다.

export const WORKSHOP = {
  title: "우리 팀 강점지도",
  courseTitle: "신입사원 온보딩 워크숍",
  instructor: "보람 강사",
  viaUrl: "https://www.viacharacter.org/",
};

export type VirtueKey = "wis" | "cou" | "hum" | "jus" | "tem" | "tra";

export const VIRTUES: { key: VirtueKey; name: string; color: string; question: string }[] = [
  { key: "wis", name: "지혜", color: "#3f6fd8", question: "새로운 시도와 학습을 업무에 녹일 기회는 어디에 있을까요? 아이디어를 실험해 볼 작은 프로젝트를 정해 봅시다." },
  { key: "cou", name: "용기", color: "#d4572f", question: "어려운 일을 끝까지 밀고 가는 힘이 우리의 자산입니다. 솔직한 피드백을 주고받는 우리만의 규칙을 만들어 볼까요?" },
  { key: "hum", name: "인간애", color: "#c7487f", question: "서로를 챙기는 힘이 강한 팀입니다. 바쁜 시기에도 이 따뜻함을 지키려면 어떤 습관이 필요할까요?" },
  { key: "jus", name: "정의", color: "#2f8f7a", question: "함께 일하고 공정하게 나누는 데 강합니다. 역할 분담과 의사결정 방식을 어떻게 정하면 좋을까요?" },
  { key: "tem", name: "절제", color: "#7a5bc4", question: "신중하고 꾸준한 팀입니다. 속도가 필요한 순간에는 누가 먼저 결정을 이끌어 줄 수 있을까요?" },
  { key: "tra", name: "초월", color: "#c08a1e", question: "의미와 희망을 찾는 힘이 큽니다. 우리 일이 누구에게 어떤 의미가 있는지 한 문장으로 적어 봅시다." },
];

export type Strength = { key: string; name: string; virtue: VirtueKey; desc: string };

// VIA 24개 성격강점 (설명은 자체 요약 문구)
export const STRENGTHS: Strength[] = [
  { key: "creativity", name: "창의성", virtue: "wis", desc: "새롭고 쓸모 있는 방식을 떠올림" },
  { key: "curiosity", name: "호기심", virtue: "wis", desc: "경험 자체에 흥미를 느끼고 탐색함" },
  { key: "judgment", name: "판단력", virtue: "wis", desc: "여러 측면을 따져 보고 근거로 생각함" },
  { key: "love_learning", name: "학구열", virtue: "wis", desc: "새 지식과 기술을 익히는 것을 즐김" },
  { key: "perspective", name: "통찰력", virtue: "wis", desc: "넓은 관점에서 지혜로운 조언을 건넴" },
  { key: "bravery", name: "용감함", virtue: "cou", desc: "위협이나 어려움 앞에서 물러서지 않음" },
  { key: "perseverance", name: "끈기", virtue: "cou", desc: "시작한 일을 장애물이 있어도 마무리함" },
  { key: "honesty", name: "정직", virtue: "cou", desc: "진실을 말하고 자신을 꾸밈없이 드러냄" },
  { key: "zest", name: "열정", virtue: "cou", desc: "활력과 에너지로 일과 삶에 임함" },
  { key: "love", name: "사랑", virtue: "hum", desc: "가까운 관계를 소중히 여기고 가꿈" },
  { key: "kindness", name: "친절", virtue: "hum", desc: "다른 사람을 돕고 배려하는 데서 기쁨을 느낌" },
  { key: "social_intel", name: "사회지능", virtue: "hum", desc: "나와 타인의 감정·동기를 잘 알아차림" },
  { key: "teamwork", name: "팀워크", virtue: "jus", desc: "집단의 일원으로서 책임을 다함" },
  { key: "fairness", name: "공정성", virtue: "jus", desc: "모든 사람을 같은 기준으로 대함" },
  { key: "leadership", name: "리더십", virtue: "jus", desc: "집단이 목표를 이루도록 조직하고 이끎" },
  { key: "forgiveness", name: "용서", virtue: "tem", desc: "잘못한 사람에게 다시 기회를 줌" },
  { key: "humility", name: "겸손", virtue: "tem", desc: "성과를 내세우지 않고 스스로를 낮춤" },
  { key: "prudence", name: "신중함", virtue: "tem", desc: "말과 행동 전에 결과를 따져 봄" },
  { key: "self_reg", name: "자기조절", virtue: "tem", desc: "감정과 행동을 스스로 다스림" },
  { key: "beauty", name: "심미안", virtue: "tra", desc: "아름다움과 탁월함을 알아보고 감탄함" },
  { key: "gratitude", name: "감사", virtue: "tra", desc: "좋은 일을 알아차리고 고마움을 표현함" },
  { key: "hope", name: "희망", virtue: "tra", desc: "좋은 미래를 기대하고 그를 위해 노력함" },
  { key: "humor", name: "유머", virtue: "tra", desc: "웃음을 주고 상황의 밝은 면을 봄" },
  { key: "spirituality", name: "영성", virtue: "tra", desc: "삶의 의미와 더 큰 목적을 추구함" },
];

export const STRENGTH_BY_KEY = Object.fromEntries(STRENGTHS.map((s) => [s.key, s])) as Record<string, Strength>;
export const VIRTUE_BY_KEY = Object.fromEntries(VIRTUES.map((v) => [v.key, v])) as Record<VirtueKey, (typeof VIRTUES)[number]>;

export type Member = {
  id: string;
  name: string;
  top5: string[];
  updatedAt: string;
};

// 공개 지도용 (id 제외)
export type MapMember = Omit<Member, "id">;

export function cleanTop5(input: unknown): string[] | null {
  if (!Array.isArray(input) || input.length !== 5) return null;
  const out = input.map((v) => (typeof v === "string" && STRENGTH_BY_KEY[v] ? v : ""));
  if (out.some((v) => !v) || new Set(out).size !== 5) return null;
  return out;
}

export type MapStats = {
  count: Record<string, number>;
  holders: Record<string, { name: string; rank: number }[]>;
  virtueScore: Record<VirtueKey, number>;
  virtueTotal: number;
  maxCount: number;
};

// 1위 5점 ~ 5위 1점 가중
export function computeStats(members: MapMember[]): MapStats {
  const count: Record<string, number> = {};
  const holders: MapStats["holders"] = {};
  for (const s of STRENGTHS) {
    count[s.key] = 0;
    holders[s.key] = [];
  }
  const virtueScore = Object.fromEntries(VIRTUES.map((v) => [v.key, 0])) as Record<VirtueKey, number>;
  for (const m of members) {
    m.top5.forEach((k, i) => {
      const s = STRENGTH_BY_KEY[k];
      if (!s) return;
      count[k]++;
      holders[k].push({ name: m.name, rank: i + 1 });
      virtueScore[s.virtue] += 5 - i;
    });
  }
  for (const k of Object.keys(holders)) holders[k].sort((a, b) => a.rank - b.rank);
  const virtueTotal = Object.values(virtueScore).reduce((a, b) => a + b, 0);
  return { count, holders, virtueScore, virtueTotal, maxCount: Math.max(1, ...Object.values(count)) };
}
