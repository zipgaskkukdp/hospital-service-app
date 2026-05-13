import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConsultation } from "../api/consultation.api";

export function ConsultationNewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", age: "4", gender: "female", symptoms: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const consultation = await createConsultation({
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        symptoms: form.symptoms
      });
      navigate(`/consultations/${consultation.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "문진 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel max-w-3xl">
      <h1 className="text-xl font-bold">스마트 분석 입력</h1>
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label>
          <span className="label">이름</span>
          <input className="input" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        </label>
        <label>
          <span className="label">나이</span>
          <input className="input" type="number" min={0} max={20} value={form.age} onChange={(event) => updateField("age", event.target.value)} required />
        </label>
        <label>
          <span className="label">성별</span>
          <select className="input" value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
            <option value="female">female</option>
            <option value="male">male</option>
            <option value="other">other</option>
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="label">증상</span>
          <textarea className="input min-h-40" value={form.symptoms} onChange={(event) => updateField("symptoms", event.target.value)} required />
        </label>
        <div className="sm:col-span-2">
          <button className="btn" type="submit" disabled={loading}>
            분석 시작
          </button>
        </div>
      </form>
    </section>
  );
}
