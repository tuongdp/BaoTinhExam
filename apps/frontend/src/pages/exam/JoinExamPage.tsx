import { DoorOpen, LogOut } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
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
    <main className="min-h-screen bg-background p-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between py-4">
        <h1 className="text-xl font-semibold">ExamHub</h1>
        <Button className="bg-slate-900 dark:bg-slate-700" onClick={logout}>
          <LogOut size={18} />
          Logout
        </Button>
      </div>
      <form onSubmit={submit} className="mx-auto mt-20 max-w-md space-y-4 rounded-md border border-border p-6">
        <div>
          <h2 className="text-2xl font-semibold">Join exam room</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter the 6-character room code from your administrator.</p>
        </div>
        <Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={6} />
        <Button className="w-full">
          <DoorOpen size={18} />
          Join room
        </Button>
      </form>
    </main>
  );
};
