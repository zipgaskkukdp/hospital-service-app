import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";

export function LoginPage() {
  const navigate = useNavigate();
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
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <form className="panel w-full max-w-md space-y-4" onSubmit={onSubmit}>
        <div>
          <h1 className="text-2xl font-bold text-slate-950">로그인</h1>
          <p className="mt-1 text-sm text-slate-500">Aicloud 계정으로 계속합니다.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label>
          <span className="label">Email</span>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          <span className="label">Password</span>
          <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="btn w-full" type="submit" disabled={loading}>
          로그인
        </button>
        <p className="text-center text-sm text-slate-600">
          계정이 없나요? <Link className="font-semibold text-aicloudBlue" to="/signup">회원가입</Link>
        </p>
      </form>
    </main>
  );
}
