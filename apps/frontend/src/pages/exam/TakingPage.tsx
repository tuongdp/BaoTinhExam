import { AlertTriangle, Check, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { QuestionRenderer } from "../../components/exam/QuestionRenderer";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";
import type { ExamRoom, Submission } from "../../types";
import { useSocket } from "../../hooks/useSocket";
import { useTimer } from "../../hooks/useTimer";

export const TakingPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const socket = useSocket();
  const [room, setRoom] = useState<ExamRoom | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [current, setCurrent] = useState(0);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const timer = useTimer((room?.exam.duration ?? 0) * 60);

  const storageKey = useMemo(() => `examhub:${roomId}:answers`, [roomId]);

  useEffect(() => {
    const load = async () => {
      const roomResponse = await api.get<ExamRoom>(`/rooms/${roomId}`);
      setRoom(roomResponse.data);
      const startResponse = await api.post<Submission>("/submissions/start", { roomId: Number(roomId) });
      setSubmission(startResponse.data);
      const cached = localStorage.getItem(storageKey);
      setAnswers(cached ? (JSON.parse(cached) as Record<string, unknown>) : startResponse.data.answers ?? {});
    };
    void load();
  }, [roomId, storageKey]);

  useEffect(() => {
    if (!room || !user) return;
    socket.emit("join-room", { roomId: room.id, userId: user.id });
    socket.emit("request-time", { roomId: room.id });
    socket.on("time-sync", ({ remainingSeconds }: { remainingSeconds: number }) => timer.setSeconds(remainingSeconds));
    socket.on("time-up", () => void submit(true));
    socket.on("kicked", () => {
      toast.error("Bạn đã bị mời khỏi phòng thi");
      navigate("/exam/join");
    });
    return () => {
      socket.off("time-sync");
      socket.off("time-up");
      socket.off("kicked");
    };
  }, [room, user, socket]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(answers));
    if (!submission) return;
    const id = window.setTimeout(() => {
      void api.post(`/submissions/${submission.id}/save`, { answers });
    }, 500);
    return () => window.clearTimeout(id);
  }, [answers, storageKey, submission]);

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden && submission) void api.patch(`/submissions/${submission.id}/tab-switch`);
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [submission]);

  const items = room?.exam.examItems ?? [];
  const question = items[current]?.question;
  const answeredCount = items.filter((item) => answers[String(item.question.id)] != null && answers[String(item.question.id)] !== "").length;
  const progress = items.length ? Math.round((answeredCount / items.length) * 100) : 0;
  const unansweredCount = Math.max(items.length - answeredCount, 0);

  const submit = async (forced = false) => {
    if (!submission) return;
    if (!forced && unansweredCount > 0 && !window.confirm(`Bạn còn ${unansweredCount} câu chưa làm. Bạn vẫn muốn nộp bài?`)) return;
    if (!forced && unansweredCount === 0 && !window.confirm("Bạn muốn nộp bài ngay bây giờ?")) return;
    await api.post(`/submissions/${submission.id}/save`, { answers });
    await api.post(`/submissions/${submission.id}/submit`);
    localStorage.removeItem(storageKey);
    navigate(`/exam/result/${submission.id}`);
  };

  if (!room || !submission || !question) return <div className="p-6">Đang tải bài thi...</div>;

  const updateAnswer = (questionId: number, value: unknown) => setAnswers((prev) => ({ ...prev, [String(questionId)]: value }));

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 lg:pb-0">
      <header className="sticky top-0 z-10 border-b border-border bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold text-[#202124]">{room.exam.title}</h1>
            <p className="text-sm text-muted-foreground">
              Đã trả lời {answeredCount}/{items.length}
            </p>
            <Progress className="mt-2" value={progress} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className="rounded px-3 py-2 font-mono text-sm">
              {timer.label}
            </Badge>
            <Button className="hidden sm:inline-flex" onClick={() => void submit()}>
              <Check size={18} />
              Nộp bài
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-4 p-3 sm:p-4 lg:grid-cols-[1fr_260px]">
        <section className="space-y-4">
          {room.exam.mode === "ALL_AT_ONCE" ? (
            items.map((item, index) => (
              <div key={item.id} id={`question-${item.question.id}`} className="scroll-mt-24">
                <div className="mb-2 text-sm font-medium text-muted-foreground">Câu {index + 1}</div>
                <QuestionRenderer question={item.question} value={answers[String(item.question.id)]} onChange={(value) => updateAnswer(item.question.id, value)} />
              </div>
            ))
          ) : (
            <>
              <QuestionRenderer question={question} value={answers[String(question.id)]} onChange={(value) => updateAnswer(question.id, value)} />
              <div className="hidden flex-wrap items-center justify-between gap-2 sm:flex">
                <Button variant="secondary" disabled={current === 0 || !room.exam.canGoBack} onClick={() => setCurrent((value) => Math.max(0, value - 1))}>
                  <ChevronLeft size={18} />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFlagged((prev) => new Set(prev.has(question.id) ? [...prev].filter((id) => id !== question.id) : [...prev, question.id]))}
                >
                  <Flag size={18} />
                  Đánh dấu
                </Button>
                <Button disabled={current === items.length - 1} onClick={() => setCurrent((value) => Math.min(items.length - 1, value + 1))}>
                  Tiếp
                  <ChevronRight size={18} />
                </Button>
              </div>
            </>
          )}
        </section>
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle size={16} />
              Tiến độ, còn {unansweredCount} câu chưa làm
            </div>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  className={`h-10 rounded border text-sm transition-colors ${index === current ? "border-primary" : "border-input"} ${
                    answers[String(item.question.id)] ? "bg-primary text-primary-foreground" : "bg-white hover:bg-accent"
                  } ${flagged.has(item.question.id) ? "ring-2 ring-[#FBBC04]" : ""}`}
                  onClick={() => {
                    setCurrent(index);
                    document.getElementById(`question-${item.question.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 gap-2 border-t border-border bg-white p-3 shadow-[0_-2px_4px_rgba(0,0,0,0.08)] sm:hidden">
        <Button variant="secondary" className="px-2 text-xs" disabled={current === 0 || !room.exam.canGoBack || room.exam.mode === "ALL_AT_ONCE"} onClick={() => setCurrent((value) => Math.max(0, value - 1))}>
          <ChevronLeft size={16} />
          Trước
        </Button>
        <Button variant="outline" className="px-2 text-xs" disabled={room.exam.mode === "ALL_AT_ONCE"} onClick={() => setFlagged((prev) => new Set(prev.has(question.id) ? [...prev].filter((id) => id !== question.id) : [...prev, question.id]))}>
          <Flag size={16} />
          Đánh dấu
        </Button>
        <Button className="px-2 text-xs" disabled={current === items.length - 1 || room.exam.mode === "ALL_AT_ONCE"} onClick={() => setCurrent((value) => Math.min(items.length - 1, value + 1))}>
          Tiếp
          <ChevronRight size={16} />
        </Button>
        <Button className="px-2 text-xs" onClick={() => void submit()}>
          <Check size={16} />
          Nộp bài
        </Button>
      </div>
    </main>
  );
};
