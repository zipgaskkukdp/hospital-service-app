import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { SiteFooter } from "../components/SiteFooter";

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: "",
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    nickname: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        nickname: form.nickname,
        phone: form.phone
      });
      navigate("/login", {
        replace: true,
        state: {
          notice: "회원가입이 완료되었습니다. 이메일 인증 안내를 확인한 뒤 다시 로그인해 주세요."
        }
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F6FAFE] text-slate-950">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[620px] p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-[#2563EB]">
              <span className="material-symbols-outlined text-[30px]">health_and_safety</span>
            </div>
            <h1 className="mt-5 text-3xl font-bold">회원가입</h1>
            <p className="mt-3 text-base text-slate-600">Aicloud와 함께 스마트한 진료를 시작하세요.</p>
          </div>
          <form className="space-y-5" onSubmit={onSubmit}>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <Input
              label="아이디"
              onChange={(event) => updateField("userId", event.target.value)}
              placeholder="아이디를 입력해주세요"
              value={form.userId}
            />
            <Input
              autoComplete="email"
              label="이메일"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="example@aicloud.com"
              required
              type="email"
              value={form.email}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                autoComplete="new-password"
                label="비밀번호"
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="8자 이상 영문, 숫자 조합"
                required
                type="password"
                value={form.password}
              />
              <Input
                autoComplete="new-password"
                label="비밀번호 확인"
                onChange={(event) => updateField("passwordConfirm", event.target.value)}
                placeholder="비밀번호 재입력"
                required
                type="password"
                value={form.passwordConfirm}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="이름" onChange={(event) => updateField("name", event.target.value)} placeholder="실명 입력" required value={form.name} />
              <Input label="닉네임" onChange={(event) => updateField("nickname", event.target.value)} placeholder="사용할 닉네임" required value={form.nickname} />
            </div>
            <Input
              autoComplete="tel"
              label="휴대폰 번호"
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="'-' 없이 숫자만 입력"
              required
              type="tel"
              value={form.phone}
            />
            <Button className="h-14 text-base" disabled={loading} fullWidth type="submit">
              {loading ? "가입 중" : "가입하기"}
            </Button>
          </form>
          <p className="mt-8 text-center text-base text-slate-600">
            이미 계정이 있으신가요?{" "}
            <Link className="font-semibold text-[#2563EB] hover:underline" to="/login">
              로그인
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
