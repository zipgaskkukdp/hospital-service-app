import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { getAccessToken } from "./api/client";
import { Layout } from "./components/Layout";
import { BoardDetailPage } from "./pages/BoardDetailPage";
import { BoardListPage } from "./pages/BoardListPage";
import { ConsultationDetailPage } from "./pages/ConsultationDetailPage";
import { ConsultationNewPage } from "./pages/ConsultationNewPage";
import { ConsultationResultPage } from "./pages/ConsultationResultPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { HospitalRecommendPage } from "./pages/HospitalRecommendPage";
import { LoginPage } from "./pages/LoginPage";
import { MypagePage } from "./pages/MypagePage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignupPage } from "./pages/SignupPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

function RequireAuth() {
  return getAccessToken() ? <Outlet /> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/mypage" element={<MypagePage />} />
          <Route path="/consultations/new" element={<ConsultationNewPage />} />
          <Route path="/consultations/:id" element={<ConsultationDetailPage />} />
          <Route path="/consultations/:id/result" element={<ConsultationResultPage />} />
          <Route path="/board" element={<BoardListPage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />
          <Route path="/hospitals/recommend" element={<HospitalRecommendPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
