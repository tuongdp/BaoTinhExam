import { DoorOpen, LogOut } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";
import type { ExamRoom } from "../../types";

export const JoinExamPage = () => {
  const [code, setCode] = useState("ABC123");
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const { data } = await api.post<ExamRoom>("/rooms/join", { code });
    navigate(`/exam/taking/${data.id}`);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between py-4">
        <h1 className="text-xl font-semibold text-[#202124]">BaoTinh Exam</h1>
        <Button variant="secondary" onClick={logout}>
          <LogOut size={18} />
          Đăng xuất
        </Button>
      </div>
      <Card className="mx-auto mt-20 max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Vào phòng thi</CardTitle>
          <CardDescription>Nhập mã phòng 6 ký tự do giáo viên hoặc quản trị viên cung cấp.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={6} />
            <Button className="w-full">
              <DoorOpen size={18} />
              Vào phòng
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};
