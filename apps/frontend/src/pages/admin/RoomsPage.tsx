import { Plus, Play, Square, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { api } from "../../services/api";
import type { Exam, ExamRoom, Page } from "../../types";

const roomStatusLabel: Record<ExamRoom["status"], string> = {
  WAITING: "Đang chờ",
  IN_PROGRESS: "Đang thi",
  ENDED: "Đã kết thúc"
};

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
    toast.success("Đã tạo phòng thi");
    setName("");
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Phòng thi</h1>
        <Button className="shrink-0" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          <span className="hidden sm:inline">{open ? "Đóng" : "Thêm phòng"}</span>
        </Button>
      </div>

      {open ? (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <form onSubmit={submit} className="space-y-3">
              <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên phòng" />
              <Select value={examId === "" ? "" : String(examId)} onValueChange={(value) => setExamId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đề thi" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={String(exam.id)}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="flex items-center gap-2">
                <Checkbox checked={isPrivate} onCheckedChange={(checked) => setIsPrivate(Boolean(checked))} />
                Phòng riêng tư
              </Label>
              <Button disabled={!examId} className="w-full sm:w-auto">
                <Plus size={18} />
                Tạo phòng
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">{room.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Mã {room.code}</Badge>
                <Badge variant={room.status === "IN_PROGRESS" ? "default" : "secondary"}>{roomStatusLabel[room.status]}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex">
              <Button className="px-3" disabled={room.status !== "WAITING"} onClick={() => void patch(room, "start")}>
                <Play size={16} />
                Bắt đầu
              </Button>
              <Button variant="secondary" className="px-3" disabled={room.status === "ENDED"} onClick={() => void patch(room, "end")}>
                <Square size={16} />
                Kết thúc
              </Button>
            </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
