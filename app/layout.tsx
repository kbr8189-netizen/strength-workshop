import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WORKSHOP } from "@/lib/strengths";

export const metadata: Metadata = {
  title: `${WORKSHOP.title} · ${WORKSHOP.courseTitle}`,
  description: "VIA 성격강점 진단 결과로 그리는 팀 강점지도",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <div className="grow">{children}</div>
        <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs leading-relaxed text-slate-500">
          진단은 VIA Institute on Character 공식 사이트(viacharacter.org)에서 진행합니다. 이 앱은 진단 문항을 담고 있지 않으며,
          결과는 자기이해와 팀 대화를 위한 것으로 평가·배치에 사용하지 않습니다.
          <br />
          {WORKSHOP.instructor}의 {WORKSHOP.courseTitle} · {WORKSHOP.title}
        </footer>
      </body>
    </html>
  );
}
