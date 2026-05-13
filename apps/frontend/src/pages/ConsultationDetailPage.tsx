import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { completeConsultation, Consultation, getConsultation } from "../api/consultation.api";

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
    <section className="panel max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">문진 상세</h1>
          <p className="mt-1 text-sm text-slate-500">{consultation.status}</p>
        </div>
        <Link className="btn-secondary" to={`/consultations/${consultation.id}/result`}>
          결과 보기
        </Link>
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
      <button className="btn" type="button" onClick={onComplete} disabled={loading}>
        분석 시작
      </button>
    </section>
  );
}
