import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../api/auth.api";

const navItems = [
  { to: "/mypage", label: "마이페이지" },
  { to: "/consultations/new", label: "스마트 분석" },
  { to: "/board", label: "게시판" },
  { to: "/hospitals/recommend", label: "병원 추천" }
];

export function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link to="/consultations/new" className="text-xl font-bold text-slate-950">
            Aicloud
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 font-medium ${isActive ? "text-aicloudBlue" : "text-slate-600 hover:text-slate-950"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              로그아웃
            </button>
          </nav>
        </div>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
