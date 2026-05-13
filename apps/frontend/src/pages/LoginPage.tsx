import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
      navigate("/consultations/new");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6FAFE] px-4 py-10 text-slate-950">
      <Card className="w-full max-w-[420px] border-slate-300/80 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-xl font-bold text-[#0053DB]">Aicloud</p>
          <h1 className="mt-4 text-2xl font-bold">로그인</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">안전하고 편리한 AI 의료 상담을 시작하세요</p>
        </div>
        <form className="space-y-5" onSubmit={onSubmit}>
          {notice && <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</p>}
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <Input
            autoComplete="email"
            icon="mail"
            label="이메일"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            required
            type="email"
            value={email}
          />
          <Input
            autoComplete="current-password"
            icon="lock"
            label="비밀번호"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            type="password"
            value={password}
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600">
              <input className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" type="checkbox" />
              로그인 유지
            </label>
            <Link className="font-semibold text-[#2563EB] hover:underline" to="/forgot-password">
              비밀번호 찾기
            </Link>
          </div>
          <Button className="h-14 text-base" disabled={loading} fullWidth type="submit">
            {loading ? "로그인 중" : "로그인"}
          </Button>
        </form>
        <div className="my-8 flex items-center gap-4 text-sm text-slate-500">
          <div className="h-px flex-1 bg-slate-300" />
          <span>또는</span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>
        <div className="space-y-3">
          <Button className="h-14 text-base" fullWidth icon="chat_bubble" variant="secondary">
            카카오로 로그인
          </Button>
          <Button className="h-14 text-base" fullWidth icon="travel_explore" variant="secondary">
            네이버로 로그인
          </Button>
        </div>
        <p className="mt-8 text-center text-base text-slate-600">
          계정이 없으신가요?{" "}
          <Link className="font-semibold text-[#2563EB] hover:underline" to="/signup">
            회원가입
          </Link>
        </p>
      </Card>
    </main>
  );
}
