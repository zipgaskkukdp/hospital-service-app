import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { changePassword, getMe, PublicUser, updateMe } from "../api/auth.api";
import { Consultation, listConsultations } from "../api/consultation.api";
import { formatDateTime } from "../utils/date";

export function MypagePage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [nickname, setNickname] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void Promise.all([getMe(), listConsultations()]).then(([me, nextConsultations]) => {
      setUser(me);
      setNickname(me.nickname);
      setConsultations(nextConsultations);
    });
  }, []);

  async function onNicknameSubmit(event: FormEvent) {
    event.preventDefault();
    const updated = await updateMe({ nickname });
    setUser(updated);
    setMessage("닉네임이 수정되었습니다.");
  }

  async function onPasswordSubmit(event: FormEvent) {
    event.preventDefault();
    await changePassword(passwords);
    setPasswords({ currentPassword: "", newPassword: "" });
    setMessage("비밀번호가 수정되었습니다.");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <section className="panel space-y-4">
        <div>
          <h1 className="text-xl font-bold">마이페이지</h1>
          <p className="mt-1 text-sm text-slate-500">{user?.email ?? "계정 정보를 불러오는 중입니다."}</p>
        </div>
        {message && <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>}
        <form className="space-y-3" onSubmit={onNicknameSubmit}>
          <label>
            <span className="label">Nickname</span>
            <input className="input" value={nickname} onChange={(event) => setNickname(event.target.value)} />
          </label>
          <button className="btn" type="submit">닉네임 수정</button>
        </form>
        <form className="space-y-3 border-t border-slate-200 pt-4" onSubmit={onPasswordSubmit}>
          <label>
            <span className="label">현재 비밀번호</span>
            <input className="input" type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} />
          </label>
          <label>
            <span className="label">새 비밀번호</span>
            <input className="input" type="password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} />
          </label>
          <button className="btn" type="submit">비밀번호 수정</button>
        </form>
      </section>
      <section className="panel">
        <h2 className="text-lg font-bold">과거 진단표 이미지</h2>
        <div className="mt-4 space-y-3">
          {consultations.map((consultation) => (
            <Link key={consultation.id} to={`/consultations/${consultation.id}/result`} className="block border border-slate-200 bg-slate-50 p-4 hover:border-aicloudBlue" style={{ borderRadius: 8 }}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-900">{consultation.symptomSummary || "문진"}</span>
                <span className="text-sm text-slate-500">{consultation.status}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>작성 {formatDateTime(consultation.createdAt)}</span>
                <span>수정 {formatDateTime(consultation.updatedAt)}</span>
              </div>
            </Link>
          ))}
          {consultations.length === 0 && <p className="text-sm text-slate-500">표시할 진단표가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}
