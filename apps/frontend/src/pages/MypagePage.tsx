import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword, getMe, logout, PublicUser, updateMe } from "../api/auth.api";
import { Consultation, listConsultations } from "../api/consultation.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { formatDateTime } from "../utils/date";

export function MypagePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [nickname, setNickname] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([getMe(), listConsultations()]).then(([me, nextConsultations]) => {
      setUser(me);
      setNickname(me.nickname);
      setConsultations(nextConsultations);
    });
  }, []);

  async function onNicknameSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const updated = await updateMe({ nickname });
      setUser(updated);
      setMessage("닉네임이 수정되었습니다.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "닉네임 수정에 실패했습니다.");
    }
  }

  async function onPasswordSubmit(event: FormEvent) {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setError("");
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("비밀번호가 수정되었습니다.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "비밀번호 수정에 실패했습니다.");
    }
  }

  const recentConsultations = consultations.slice(0, 2);

  return (
    <div>
      <PageHeader description="회원 정보 관리 및 진료 기록을 확인할 수 있습니다." title="마이페이지" />
      <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
        <Card className="self-start p-6">
          <h2 className="border-b border-slate-200 pb-5 text-xl font-bold">회원 정보</h2>
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-slate-300">
              <span className="material-symbols-outlined text-[64px]">person</span>
              <button className="absolute bottom-1 right-1 rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm" type="button">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <p className="text-sm text-slate-500">{user?.email ?? "계정 정보를 불러오는 중입니다."}</p>
          </div>
          {(message || error) && (
            <p className={`mt-6 rounded-lg px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
              {error || message}
            </p>
          )}
          <form className="mt-6 space-y-4" onSubmit={onNicknameSubmit}>
            <Input label="닉네임" onChange={(event) => setNickname(event.target.value)} placeholder="닉네임을 입력하세요" value={nickname} />
            <Button fullWidth type="submit">
              정보 저장
            </Button>
          </form>
          <form className="mt-6 space-y-4 border-t border-slate-200 pt-6" onSubmit={onPasswordSubmit}>
            <Input
              autoComplete="current-password"
              label="현재 비밀번호"
              onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
              placeholder="현재 비밀번호 입력"
              type="password"
              value={passwords.currentPassword}
            />
            <Input
              autoComplete="new-password"
              label="비밀번호 변경"
              onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
              placeholder="새 비밀번호 입력"
              type="password"
              value={passwords.newPassword}
            />
            <Input
              autoComplete="new-password"
              onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
              placeholder="새 비밀번호 확인"
              type="password"
              value={passwords.confirmPassword}
            />
            <Button fullWidth type="submit">
              비밀번호 수정
            </Button>
          </form>
          <Button
            className="mt-3"
            fullWidth
            onClick={() => {
              logout();
              navigate("/login");
            }}
            variant="ghost"
          >
            로그아웃
          </Button>
        </Card>
        <section>
          <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-5">
            <h2 className="text-2xl font-bold">최근 진료 내역</h2>
            <Link className="text-sm font-semibold text-[#2563EB] hover:underline" to="/consultations/new">
              새 문진 작성
            </Link>
          </div>
          {recentConsultations.length === 0 ? (
            <EmptyState
              action={<Link className="font-semibold text-[#2563EB]" to="/consultations/new">스마트 분석 시작하기</Link>}
              description="아직 저장된 문진과 리포트가 없습니다."
              icon="clinical_notes"
              title="진료 내역이 없습니다"
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {recentConsultations.map((consultation, index) => (
                <Link
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(37,99,235,0.10)]"
                  key={consultation.id}
                  to={`/consultations/${consultation.id}/result`}
                >
                  <div className="relative h-48 overflow-hidden bg-[#0F172A]">
                    <div className={index % 2 === 0 ? "h-full w-full bg-[radial-gradient(circle_at_45%_35%,#7DD3FC_0,#2563EB_34%,#0F172A_72%)] opacity-90" : "h-full w-full bg-[radial-gradient(circle_at_55%_40%,#BAE6FD_0,#E0F2FE_36%,#475569_85%)] opacity-90"} />
                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[72px] text-white/70">
                      {index % 2 === 0 ? "pulmonology" : "dermatology"}
                    </span>
                    <StatusBadge className="absolute right-3 top-3" label={consultation.status === "AI_COMPLETED" ? "정상 소견" : "주의 필요"} value={consultation.status} />
                  </div>
                  <div className="p-5">
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {formatDateTime(consultation.createdAt)}
                    </p>
                    <h3 className="mt-3 text-xl font-bold text-slate-950 group-hover:text-[#2563EB]">
                      {consultation.symptomSummary || "소아 AI 문진 분석"}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      이 결과는 의료진 진료 전 참고용 요약입니다. 지속되거나 악화되는 증상은 전문의 상담을 권장합니다.
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
