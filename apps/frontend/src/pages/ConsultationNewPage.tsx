import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeConsultation, createConsultation } from "../api/consultation.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { PageHeader } from "../components/PageHeader";
import { Textarea } from "../components/Textarea";
import { cn } from "../utils/className";

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
      await completeConsultation(consultation.id);
      navigate(`/consultations/${consultation.id}/result`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "문진 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader
        align="center"
        description="아이의 증상을 자세히 입력해주세요. AI가 빠르고 정확하게 상태를 먼저 살펴드립니다."
        icon="smart_toy"
        title="스마트 분석 입력"
      />
      <Card className="p-6 sm:p-10">
        {error && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <form className="grid gap-7 sm:grid-cols-2" onSubmit={onSubmit}>
          <Input
            icon="person"
            label="아이 이름"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="이름을 입력해주세요"
            required
            value={form.name}
          />
          <Input
            icon="cake"
            label="나이 ·개월/세"
            max={20}
            min={0}
            onChange={(event) => updateField("age", event.target.value)}
            placeholder="숫자만 입력해주세요"
            required
            type="number"
            value={form.age}
          />
          <div className="sm:col-span-2">
            <p className="label inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#2563EB]">face</span>
              성별
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { value: "male", label: "남자아이", icon: "face_2" },
                { value: "female", label: "여자아이", icon: "face_3" }
              ].map((item) => (
                <label
                  className={cn(
                    "flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 bg-[#F1F5F9] text-slate-600 transition",
                    form.gender === item.value ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-transparent hover:bg-slate-100"
                  )}
                  key={item.value}
                >
                  <input
                    checked={form.gender === item.value}
                    className="sr-only"
                    name="gender"
                    onChange={() => updateField("gender", item.value)}
                    type="radio"
                    value={item.value}
                  />
                  <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Textarea
              icon="medical_services"
              label="주요 증상"
              onChange={(event) => updateField("symptoms", event.target.value)}
              placeholder="언제부터 증상이 시작되었는지, 열이 나는지 등 자세한 상황을 적어주시면 AI가 더 정확하게 분석할 수 있습니다."
              required
              rows={6}
              value={form.symptoms}
            />
          </div>
          <div className="sm:col-span-2">
            <Button className="h-16 text-lg" disabled={loading} fullWidth icon="auto_awesome" type="submit">
              {loading ? "분석 요청 중" : "AI 스마트 분석 시작하기"}
            </Button>
            <p className="mt-4 text-center text-sm text-slate-500">
              <span className="material-symbols-outlined mr-1 align-middle text-[16px]">info</span>
              본 서비스는 전문의의 진료를 대신할 수 없습니다.
            </p>
          </div>
        </form>
      </Card>
    </section>
  );
}
