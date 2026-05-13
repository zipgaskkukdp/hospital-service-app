import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../api/auth.api";
import { Card } from "../components/Card";
import { SiteFooter } from "../components/SiteFooter";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    void verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  const content = {
    error: {
      icon: "error",
      title: "인증 링크를 확인해 주세요",
      description: "이메일 인증 토큰이 없거나 만료되었습니다."
    },
    loading: {
      icon: "hourglass_empty",
      title: "이메일 인증 중",
      description: "잠시만 기다려 주세요."
    },
    success: {
      icon: "mark_email_read",
      title: "이메일 인증 완료",
      description: "이제 로그인 후 서비스를 이용할 수 있습니다."
    }
  }[status];

  return (
    <div className="flex min-h-screen flex-col bg-[#F6FAFE] text-slate-950">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[460px] p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-10">
          <span className="material-symbols-outlined text-[52px] text-[#2563EB]">{content.icon}</span>
          <h1 className="mt-5 text-3xl font-bold">{content.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{content.description}</p>
          <Link className="mt-8 inline-flex rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700" to="/login">
            로그인으로 이동
          </Link>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
