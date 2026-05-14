import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { QuestionsPage } from "./pages/admin/QuestionsPage";
import { ExamsPage } from "./pages/admin/ExamsPage";
import { RoomsPage } from "./pages/admin/RoomsPage";
import { JoinExamPage } from "./pages/exam/JoinExamPage";
import { TakingPage } from "./pages/exam/TakingPage";
import { ResultPage } from "./pages/exam/ResultPage";
import { useAuthStore } from "./store/auth";

const Guard = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.accessToken);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "USER" ? <Navigate to="/exam/join" replace /> : children;
};

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/", element: <Navigate to="/exam/join" replace /> },
  { path: "/exam/join", element: <Guard><JoinExamPage /></Guard> },
  { path: "/exam/taking/:roomId", element: <Guard><TakingPage /></Guard> },
  { path: "/exam/result/:submissionId", element: <Guard><ResultPage /></Guard> },
  {
    path: "/admin",
    element: <Guard><AdminGuard><AppLayout /></AdminGuard></Guard>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "questions", element: <QuestionsPage /> },
      { path: "exams", element: <ExamsPage /> },
      { path: "rooms", element: <RoomsPage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </React.StrictMode>
);
