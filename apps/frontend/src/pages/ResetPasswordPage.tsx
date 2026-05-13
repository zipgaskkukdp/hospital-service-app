import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { SiteFooter } from "../components/SiteFooter";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword({ token, password });
      navigate("/login", { replace: true, state: { notice: "비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요." } });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "비밀번호 재설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F6FAFE] text-slate-950">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[460px] p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-10">
          <span className="material-symbols-outlined text-[52px] text-[#2563EB]">password</span>
          <h1 className="mt-5 text-3xl font-bold">비밀번호 재설정</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">새 비밀번호를 입력해 주세요.</p>
          <form className="mt-8 space-y-5 text-left" onSubmit={onSubmit}>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {!token && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">재설정 토큰이 없습니다.</p>}
            <Input
              autoComplete="new-password"
              label="새 비밀번호"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="새 비밀번호 입력"
              required
              type="password"
              value={password}
            />
            <Input
              autoComplete="new-password"
              label="새 비밀번호 확인"
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="새 비밀번호 재입력"
              required
              type="password"
              value={confirm}
            />
            <Button className="h-14 text-base" disabled={loading || !token} fullWidth type="submit">
              {loading ? "변경 중" : "비밀번호 변경"}
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
