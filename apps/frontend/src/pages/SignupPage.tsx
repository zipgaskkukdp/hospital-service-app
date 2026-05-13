import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth.api";

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
      navigate("/consultations/new");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <form className="panel w-full max-w-xl space-y-4" onSubmit={onSubmit}>
        <div>
          <h1 className="text-2xl font-bold text-slate-950">회원가입</h1>
          <p className="mt-1 text-sm text-slate-500">이름과 연락처는 내부 민감정보 API로만 전달됩니다.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label">Email</span>
            <input className="input" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
          </label>
          <label>
            <span className="label">Password</span>
            <input className="input" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
          </label>
          <label>
            <span className="label">Password 확인</span>
            <input className="input" type="password" value={form.passwordConfirm} onChange={(event) => updateField("passwordConfirm", event.target.value)} required />
          </label>
          <label>
            <span className="label">Name</span>
            <input className="input" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          </label>
          <label>
            <span className="label">Nickname</span>
            <input className="input" value={form.nickname} onChange={(event) => updateField("nickname", event.target.value)} required />
          </label>
          <label className="sm:col-span-2">
            <span className="label">Phone</span>
            <input className="input" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
          </label>
        </div>
        <button className="btn w-full" type="submit" disabled={loading}>
          회원가입
        </button>
        <p className="text-center text-sm text-slate-600">
          이미 계정이 있나요? <Link className="font-semibold text-aicloudBlue" to="/login">로그인</Link>
        </p>
      </form>
    </main>
  );
}
