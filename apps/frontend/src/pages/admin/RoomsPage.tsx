import { Plus, Play, Square, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";
import type { Exam, ExamRoom, Page } from "../../types";

export const RoomsPage = () => {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [examId, setExamId] = useState<number | "">("");
  const [isPrivate, setIsPrivate] = useState(false);

  const load = () => void api.get<Page<ExamRoom>>("/rooms").then(({ data }) => setRooms(data.items));

  useEffect(() => {
    load();
    void api.get<Page<Exam>>("/exams", { params: { isPublished: true, limit: 100 } }).then(({ data }) => {
      setExams(data.items);
      setExamId(data.items[0]?.id ?? "");
    });
  }, []);

  const patch = async (room: ExamRoom, action: "start" | "end") => {
    await api.patch(`/rooms/${room.id}/${action}`);
    load();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!examId) return;
    await api.post("/rooms", { name, examId, isPrivate });
    toast.success("Room created");
    setName("");
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Exam Rooms</h1>
        <Button className="shrink-0" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          <span className="hidden sm:inline">{open ? "Close" : "New room"}</span>
        </Button>
      </div>

      {open ? (
        <form onSubmit={submit} className="space-y-3 rounded-md border border-border p-3 sm:p-4">
          <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Room name" />
          <select className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" value={examId} onChange={(event) => setExamId(Number(event.target.value))}>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
            Private room
          </label>
          <Button disabled={!examId} className="w-full sm:w-auto">
            <Plus size={18} />
            Create room
          </Button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {rooms.map((room) => (
          <article key={room.id} className="flex flex-col gap-3 rounded-md border border-border p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">{room.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Code {room.code} - {room.status}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex">
              <Button className="px-3" disabled={room.status !== "WAITING"} onClick={() => void patch(room, "start")}>
                <Play size={16} />
                Start
              </Button>
              <Button className="bg-slate-900 px-3 dark:bg-slate-700" disabled={room.status === "ENDED"} onClick={() => void patch(room, "end")}>
                <Square size={16} />
                End
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
