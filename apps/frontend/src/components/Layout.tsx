import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6FAFE] text-slate-950">
      <Navbar />
      <main className="page-shell flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
