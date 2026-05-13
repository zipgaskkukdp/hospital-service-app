import { Link, NavLink } from "react-router-dom";
import { cn } from "../utils/className";

const navItems = [
  { to: "/consultations/new", label: "스마트 분석" },
  { to: "/mypage", label: "진료 내역" },
  { to: "/hospitals/recommend", label: "주변 병원" },
  { to: "/board", label: "게시판" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-[#F6FAFE]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link className="text-xl font-bold text-[#0053DB]" to="/consultations/new">
            Aicloud
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "border-b-2 px-1 py-5 text-sm font-semibold transition",
                    isActive ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-slate-600 hover:text-[#2563EB]"
                  )
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <button aria-label="알림" className="hidden rounded-full p-2 transition hover:bg-slate-100 hover:text-[#2563EB] sm:inline-flex" type="button">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link aria-label="마이페이지" className="hidden rounded-full p-2 transition hover:bg-slate-100 hover:text-[#2563EB] sm:inline-flex" to="/mypage">
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
          <NavLink
            className={({ isActive }) =>
              cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive ? "bg-slate-100 text-[#2563EB]" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              )
            }
            to="/mypage"
          >
            내 정보
          </NavLink>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 text-sm md:hidden">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                "shrink-0 rounded-full px-3 py-2 font-semibold",
                isActive ? "bg-blue-50 text-[#2563EB]" : "text-slate-600 hover:bg-slate-100"
              )
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
