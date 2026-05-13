import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { SiteFooter } from "../components/SiteFooter";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setMessage("가입된 이메일이라면 비밀번호 재설정 안내가 발송됩니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F6FAFE] text-slate-950">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[460px] p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-10">
          <span className="material-symbols-outlined text-[52px] text-[#2563EB]">lock_reset</span>
          <h1 className="mt-5 text-3xl font-bold">비밀번호 찾기</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
          <form className="mt-8 space-y-6 text-left" onSubmit={onSubmit}>
            {message && <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>}
            <Input
              autoComplete="email"
              label="이메일"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해주세요"
              required
              type="email"
              value={email}
            />
            <Button className="h-14 text-base" disabled={loading} fullWidth type="submit">
              {loading ? "전송 중" : "비밀번호 재설정 메일 보내기"}
            </Button>
          </form>
          <Link className="mt-8 inline-flex font-semibold text-[#2563EB] hover:underline" to="/login">
            로그인으로 돌아가기
          </Link>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
