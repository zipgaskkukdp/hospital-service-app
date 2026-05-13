import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { completeConsultation, Consultation, getConsultation } from "../api/consultation.api";
import { Button, LinkButton } from "../components/Button";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { formatDateTime } from "../utils/date";

export function ConsultationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      void getConsultation(id).then(setConsultation);
    }
  }, [id]);

  async function onComplete() {
    if (!id) {
      return;
    }
    setLoading(true);
    const updated = await completeConsultation(id);
    setConsultation(updated);
    setLoading(false);
    navigate(`/consultations/${id}/result`);
  }

  if (!consultation) {
    return <section className="panel">문진을 불러오는 중입니다.</section>;
  }

  return (
    <section className="mx-auto max-w-4xl">
      <PageHeader description="문진 저장 시간과 분석 상태를 확인할 수 있습니다." title="문진 상세" />
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <StatusBadge value={consultation.status} />
          <LinkButton to={`/consultations/${consultation.id}/result`} variant="secondary">
            결과 보기
          </LinkButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bg-slate-50 p-4" style={{ borderRadius: 8 }}>
            <p className="text-sm text-slate-500">문진 작성</p>
            <p className="font-semibold">{formatDateTime(consultation.createdAt)}</p>
          </div>
          <div className="bg-slate-50 p-4" style={{ borderRadius: 8 }}>
            <p className="text-sm text-slate-500">최근 수정</p>
            <p className="font-semibold">{formatDateTime(consultation.updatedAt)}</p>
          </div>
          <div className="bg-slate-50 p-4" style={{ borderRadius: 8 }}>
            <p className="text-sm text-slate-500">분석 요청</p>
            <p className="font-semibold">{formatDateTime(consultation.contentData.ai_process?.requested_at)}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-slate-50 p-4" style={{ borderRadius: 8 }}>
            <p className="text-sm text-slate-500">나이</p>
            <p className="font-semibold">{consultation.contentData.child_info.age}</p>
          </div>
          <div className="bg-slate-50 p-4" style={{ borderRadius: 8 }}>
            <p className="text-sm text-slate-500">성별</p>
            <p className="font-semibold">{consultation.contentData.child_info.gender}</p>
          </div>
        </div>
        <div>
          <p className="label">증상 요약</p>
          <p className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{consultation.symptomSummary}</p>
        </div>
        <div>
          <p className="label">키워드</p>
          <div className="flex flex-wrap gap-2">
            {consultation.contentData.user_input.symptom_keywords.map((keyword) => (
              <span key={keyword} className="rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <Button disabled={loading} onClick={onComplete} type="button">
          {loading ? "분석 요청 중" : "분석 시작"}
        </Button>
      </Card>
    </section>
  );
}
