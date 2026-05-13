export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#F1F5F9] px-4 py-10 text-center text-sm text-slate-500">
      <div className="text-xl font-bold text-slate-950">Aicloud</div>
      <div className="mt-5 flex flex-wrap justify-center gap-x-7 gap-y-2">
        <a className="underline transition hover:text-[#2563EB]" href="#">
          이용약관
        </a>
        <a className="underline transition hover:text-[#2563EB]" href="#">
          개인정보처리방침
        </a>
        <a className="underline transition hover:text-[#2563EB]" href="#">
          병원 등록 안내
        </a>
        <a className="underline transition hover:text-[#2563EB]" href="#">
          고객센터
        </a>
      </div>
      <p className="mx-auto mt-5 max-w-3xl leading-6">
        © 2024 Aicloud. 본 서비스는 AI 기술을 활용한 상담 보조 서비스로 전문의의 대면 진료를 대신할 수 없습니다.
      </p>
    </footer>
  );
}
