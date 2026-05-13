import { FormEvent, useState } from "react";
import { HospitalRecommendation, recommendHospitals } from "../api/hospital.api";

export function HospitalRecommendPage() {
  const [form, setForm] = useState({ lat: "37.5665", lng: "126.9780", department: "pediatrics" });
  const [recommendations, setRecommendations] = useState<HospitalRecommendation[]>([]);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      setRecommendations(await recommendHospitals({
        lat: Number(form.lat),
        lng: Number(form.lng),
        department: form.department || undefined
      }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "병원 추천에 실패했습니다.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <form className="panel space-y-4" onSubmit={onSubmit}>
        <h1 className="text-xl font-bold">병원 추천</h1>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label>
          <span className="label">Latitude</span>
          <input className="input" value={form.lat} onChange={(event) => setForm((current) => ({ ...current, lat: event.target.value }))} required />
        </label>
        <label>
          <span className="label">Longitude</span>
          <input className="input" value={form.lng} onChange={(event) => setForm((current) => ({ ...current, lng: event.target.value }))} required />
        </label>
        <label>
          <span className="label">진료과</span>
          <input className="input" value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} />
        </label>
        <button className="btn" type="submit">추천 받기</button>
      </form>
      <section className="panel">
        <h2 className="text-lg font-bold">추천 결과</h2>
        <div className="mt-4 grid gap-3">
          {recommendations.map((hospital) => (
            <article key={hospital.id} className="border border-slate-200 bg-slate-50 p-4" style={{ borderRadius: 8 }}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-950">{hospital.name}</h3>
                <span className="text-sm text-aicloudBlue">{hospital.distanceMeters}m</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{hospital.address}</p>
              <p className="mt-1 text-sm text-slate-500">{hospital.department}</p>
            </article>
          ))}
          {recommendations.length === 0 && <p className="text-sm text-slate-500">추천 결과가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}
