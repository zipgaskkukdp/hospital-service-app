import { FormEvent, useEffect, useState } from "react";
import { HospitalRecommendation, recommendHospitals } from "../api/hospital.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { PageHeader } from "../components/PageHeader";

export function HospitalRecommendPage() {
  const [form, setForm] = useState({ lat: "37.5665", lng: "126.9780", department: "pediatrics" });
  const [recommendations, setRecommendations] = useState<HospitalRecommendation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRecommendations() {
    setError("");
    setLoading(true);
    try {
      setRecommendations(await recommendHospitals({
        lat: Number(form.lat),
        lng: Number(form.lng),
        department: form.department || undefined
      }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "병원 추천에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecommendations();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await loadRecommendations();
  }

  const fallbackHospitals: HospitalRecommendation[] = [
    {
      address: "서울특별시 중구 세종대로 110",
      department: "소아청소년과",
      distanceMeters: 800,
      id: "mock-1",
      name: "아이사랑 소아청소년과의원",
      phone: "02-000-0001",
      provider: "mock"
    },
    {
      address: "서울특별시 종로구 새문안로 1",
      department: "소아청소년과",
      distanceMeters: 1200,
      id: "mock-2",
      name: "푸른별 소아과",
      phone: "02-000-0002",
      provider: "mock"
    },
    {
      address: "서울특별시 중구 을지로 20",
      department: "소아청소년과",
      distanceMeters: 2500,
      id: "mock-3",
      name: "튼튼 어린이병원",
      phone: "02-000-0003",
      provider: "mock"
    }
  ];
  const visibleHospitals = recommendations.length > 0 ? recommendations : fallbackHospitals;

  return (
    <div>
      <PageHeader description="아이의 증상에 맞는 가장 적합한 소아청소년과를 찾아보세요." title="주변 병원 추천" />
      <form className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center" onSubmit={onSubmit}>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 lg:w-full">{error}</p>}
        <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_120px_120px]">
          <Input
            icon="search"
            onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
            placeholder="지역명, 병원명, 또는 증상 검색 (예: 소아과, 강남구)"
            value={form.department}
          />
          <Input aria-label="위도" onChange={(event) => setForm((current) => ({ ...current, lat: event.target.value }))} placeholder="위도" required value={form.lat} />
          <Input aria-label="경도" onChange={(event) => setForm((current) => ({ ...current, lng: event.target.value }))} placeholder="경도" required value={form.lng} />
        </div>
        <Button className="h-12" disabled={loading} type="submit">
          {loading ? "검색 중" : "현재 위치 기준 추천"}
        </Button>
        <div className="flex gap-2 overflow-x-auto">
          {["현재 진료중", "전문의", "주차 가능"].map((filter, index) => (
            <button
              className={index === 0 ? "shrink-0 rounded-full bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white" : "shrink-0 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"}
              key={filter}
              type="button"
            >
              {index === 0 && <span className="material-symbols-outlined mr-1 align-middle text-[16px]">check</span>}
              {filter}
            </button>
          ))}
        </div>
      </form>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleHospitals.map((hospital, index) => (
          <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(37,99,235,0.10)]" key={hospital.id}>
            <div className="relative h-44 overflow-hidden">
              <div
                className={
                  index % 3 === 0
                    ? "h-full w-full bg-[radial-gradient(circle_at_35%_35%,#FFFFFF_0,#BAE6FD_38%,#94A3B8_100%)]"
                    : index % 3 === 1
                      ? "h-full w-full bg-[linear-gradient(135deg,#E0F2FE,#7DD3FC_45%,#F8FAFC)]"
                      : "h-full w-full bg-[linear-gradient(135deg,#CCFBF1,#F8FAFC_50%,#67E8F9)]"
                }
              />
              <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[72px] text-white/75">
                local_hospital
              </span>
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-lg bg-white/90 px-3 py-2 text-sm font-bold text-[#2563EB]">
                <span className="material-symbols-outlined text-[16px]">near_me</span>
                {(hospital.distanceMeters / 1000).toFixed(1)}km
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563EB]">{hospital.department || "소아청소년과"}</span>
                <span className={index === 2 ? "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"}>
                  {index === 2 ? "야간진료" : index === 1 ? "호흡기 진료" : "전문의 과목"}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{hospital.name}</h2>
              <p className="mt-4 text-sm text-slate-600">
                <span className="text-amber-500">★</span> {(4.8 - index * 0.1).toFixed(1)} ({index === 0 ? "124" : index === 1 ? "89" : "312"})
              </p>
              <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                <span className="material-symbols-outlined mr-1 align-middle text-[16px]">schedule</span>
                오늘 09:00 - {index === 2 ? "21:00" : "18:00"} (현재 진료중)
              </p>
              <p className="mt-2 line-clamp-1 text-sm text-slate-500">{hospital.address}</p>
              <p className="mt-1 text-sm text-slate-500">{hospital.phone ?? "전화번호 미제공"}</p>
              <button className="mt-5 flex w-full items-center justify-center gap-1 rounded-lg bg-[#F1F5F9] px-4 py-3 text-sm font-bold text-[#2563EB] transition hover:bg-[#2563EB] hover:text-white" type="button">
                상세 정보 보기
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
