import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiResult, ConsultationAsset, getAiResult, mockProcess } from "../api/ai.api";
import { Consultation, getConsultation } from "../api/consultation.api";
import { formatDateTime } from "../utils/date";

export function ConsultationResultPage() {
  const { id } = useParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const [assets, setAssets] = useState<ConsultationAsset[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (!id) {
      return;
    }
    const [nextConsultation, payload] = await Promise.all([
      getConsultation(id),
      getAiResult(id)
    ]);
    setConsultation(nextConsultation);
    setResult(payload.result);
    setAssets(payload.assets);
    setStatus(payload.status);
  }

  useEffect(() => {
    void refresh();
  }, [id]);

  async function onMockProcess() {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      const payload = await mockProcess(id);
      setResult(payload.result);
      setAssets(payload.assets);
      setStatus(payload.result.status);
      setConsultation(await getConsultation(id));
    } finally {
      setLoading(false);
    }
  }

  const pdfAsset = assets.find((asset) => asset.assetType === "PDF");
  const imageAsset = assets.find((asset) => asset.assetType === "IMAGE");
  const latestAsset = assets[0];
  const generatedAt = typeof result?.resultJson.generated_at === "string" ? result.resultJson.generated_at : null;

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="panel space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">분석 결과</h1>
            <p className="mt-1 text-sm text-slate-500">{status}</p>
          </div>
          <button className="btn" type="button" onClick={onMockProcess} disabled={loading}>
            Mock 분석 실행
          </button>
        </div>
        <div className="aspect-[4/3] w-full border border-slate-200 bg-slate-50 p-5" style={{ borderRadius: 8 }}>
          {imageAsset?.publicUrl || imageAsset?.cloudfrontUrl ? (
            <img className="h-full w-full object-contain" src={imageAsset.publicUrl ?? imageAsset.cloudfrontUrl ?? ""} alt="분석 진단서 이미지" />
          ) : (
            <div className="flex h-full flex-col justify-between bg-white p-5" style={{ borderRadius: 8 }}>
              <div>
                <p className="text-sm font-semibold text-aicloudBlue">Aicloud Report</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-950">분석 진단서 이미지</h2>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="h-3 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
              </div>
              <p className="text-sm text-slate-500">{result?.summary ?? "결과 생성 대기 중"}</p>
            </div>
          )}
        </div>
        <a
          className={pdfAsset?.publicUrl || pdfAsset?.cloudfrontUrl ? "btn" : "btn-secondary pointer-events-none opacity-60"}
          href={pdfAsset?.publicUrl ?? pdfAsset?.cloudfrontUrl ?? "#"}
        >
          PDF 다운로드
        </a>
      </div>
      <aside className="panel space-y-4">
        <h2 className="text-lg font-bold">요약</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
          <div className="bg-slate-50 p-3" style={{ borderRadius: 8 }}>
            <dt className="text-slate-500">문진 작성</dt>
            <dd className="mt-1 font-semibold">{formatDateTime(consultation?.createdAt)}</dd>
          </div>
          <div className="bg-slate-50 p-3" style={{ borderRadius: 8 }}>
            <dt className="text-slate-500">문진 수정</dt>
            <dd className="mt-1 font-semibold">{formatDateTime(consultation?.updatedAt)}</dd>
          </div>
          <div className="bg-slate-50 p-3" style={{ borderRadius: 8 }}>
            <dt className="text-slate-500">결과 저장</dt>
            <dd className="mt-1 font-semibold">{formatDateTime(result?.createdAt)}</dd>
          </div>
          <div className="bg-slate-50 p-3" style={{ borderRadius: 8 }}>
            <dt className="text-slate-500">보고서 생성</dt>
            <dd className="mt-1 font-semibold">{formatDateTime(generatedAt ?? latestAsset?.createdAt)}</dd>
          </div>
        </dl>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">위험도</dt>
            <dd className="font-semibold">{result?.riskLevel ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">진료과 힌트</dt>
            <dd className="font-semibold">{result?.departmentHint ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">권고</dt>
            <dd className="leading-6 text-slate-700">{result?.recommendation ?? "-"}</dd>
          </div>
        </dl>
      </aside>
    </section>
  );
}
