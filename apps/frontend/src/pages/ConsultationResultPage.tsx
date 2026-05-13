import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AiResult, ConsultationAsset, getAiResult, mockProcess } from "../api/ai.api";
import { Consultation, getConsultation } from "../api/consultation.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
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
  const reportImageUrl = imageAsset?.publicUrl ?? imageAsset?.cloudfrontUrl ?? "";
  const pdfUrl = pdfAsset?.publicUrl ?? pdfAsset?.cloudfrontUrl ?? "";
  const isPending = status === "PENDING" || status === "AI_PENDING" || result?.status === "PENDING";

  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader align="center" description={isPending ? "AI 분석 결과를 생성하고 있습니다." : "AI 분석이 완료되었습니다. 아래 리포트를 확인해 주세요."} title="분석 결과" />
      <Card className="overflow-hidden">
        <div className="relative h-72 bg-slate-200 sm:h-96">
          {reportImageUrl ? (
            <img alt="분석 진단서 이미지" className="h-full w-full object-cover opacity-90" src={reportImageUrl} />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_45%,#BAE6FD_0,#7DD3FC_32%,#334155_82%)] opacity-80" />
          )}
          <div className="absolute inset-0 bg-white/25" />
          <div className="absolute bottom-5 left-5">
            <StatusBadge icon={isPending ? "hourglass_empty" : "check_circle"} label={isPending ? "생성 중" : "분석 완료"} value={isPending ? "PENDING" : "AI_COMPLETED"} />
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">종합 소견</h2>
              <p className="mt-2 text-sm text-slate-500">분석 일시: {formatDateTime(generatedAt ?? result?.createdAt ?? latestAsset?.createdAt)}</p>
              <p className="mt-1 text-sm text-slate-500">문진 작성: {formatDateTime(consultation?.createdAt)}</p>
            </div>
            <StatusBadge label={result?.riskLevel === "HIGH" ? "주의 필요" : result?.riskLevel === "MEDIUM" ? "관찰 필요" : "정상 범위"} value={result?.riskLevel ?? "UNKNOWN"} />
          </div>
          <div className="mt-7 space-y-5 text-base leading-8 text-slate-700">
            {isPending ? (
              <p>AI 분석 결과 생성 중입니다. 잠시 후 다시 확인하거나 mock mode에서 분석을 실행해 주세요.</p>
            ) : (
              <>
                <p>{result?.summary ?? "제공해주신 데이터를 바탕으로 AI 분석을 진행했습니다."}</p>
                <p>{result?.recommendation ?? "본 결과는 의료진 진료 전 참고용 요약입니다. 증상이 지속되거나 악화되면 전문의와 상담하시기 바랍니다."}</p>
              </>
            )}
          </div>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[#F1F5F9] p-4">
              <dt className="text-sm text-slate-500">추천 진료과</dt>
              <dd className="mt-1 font-semibold">{result?.departmentHint ?? "소아청소년과"}</dd>
            </div>
            <div className="rounded-lg bg-[#F1F5F9] p-4">
              <dt className="text-sm text-slate-500">결과 저장</dt>
              <dd className="mt-1 font-semibold">{formatDateTime(result?.createdAt)}</dd>
            </div>
            <div className="rounded-lg bg-[#F1F5F9] p-4">
              <dt className="text-sm text-slate-500">최근 수정</dt>
              <dd className="mt-1 font-semibold">{formatDateTime(consultation?.updatedAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-[#F1F5F9] p-6 sm:flex-row sm:justify-end">
          {isPending && (
            <Button disabled={loading} onClick={onMockProcess} variant="secondary">
              {loading ? "실행 중" : "Mock 분석 실행"}
            </Button>
          )}
          <a
            className={`inline-flex h-14 items-center justify-center gap-2 rounded-lg px-6 text-base font-semibold transition ${
              pdfUrl ? "bg-[#2563EB] text-white hover:bg-blue-700" : "pointer-events-none bg-white text-slate-400"
            }`}
            href={pdfUrl || "#"}
          >
            <span className="material-symbols-outlined">download</span>
            PDF 다운로드
          </a>
        </div>
      </Card>
    </section>
  );
}
