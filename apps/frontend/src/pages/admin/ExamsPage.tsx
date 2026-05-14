import { CheckCircle, Eye, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { api } from "../../services/api";
import type { Exam, Page, Question } from "../../types";

export const ExamsPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(30);
  const [passScore, setPassScore] = useState(5);
  const [mode, setMode] = useState<Exam["mode"]>("ALL_AT_ONCE");
  const [isPublished, setIsPublished] = useState(true);
  const [showAnswerAfter, setShowAnswerAfter] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = () => void api.get<Page<Exam>>("/exams").then(({ data }) => setExams(data.items));
  useEffect(() => {
    load();
    void api.get<Page<Question>>("/questions", { params: { limit: 100 } }).then(({ data }) => setQuestions(data.items));
  }, []);

  const totalPoints = useMemo(
    () => [...selected].reduce((sum, questionId) => sum + (questions.find((question) => question.id === questionId)?.points ?? 0), 0),
    [questions, selected]
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const items = [...selected].map((questionId, index) => ({
      questionId,
      order: index + 1,
      points: questions.find((question) => question.id === questionId)?.points ?? 1
    }));
    await api.post("/exams", {
      title,
      description,
      subject: subject || null,
      duration,
      passScore,
      mode,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultAfter: true,
      showAnswerAfter,
      maxAttempts: 1,
      canGoBack: true,
      isPublished,
      items
    });
    toast.success(isPublished ? "Đã xuất bản đề thi" : "Đã lưu bản nháp");
    setTitle("");
    setDescription("");
    setSubject("");
    setSelected(new Set());
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Đề thi</h1>
          <p className="text-sm text-muted-foreground">Cài thời gian, điểm đạt, trạng thái publish/private và gán câu hỏi vào đề.</p>
        </div>
        <Button className="shrink-0" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          <span className="hidden sm:inline">{open ? "Đóng" : "Thêm đề thi"}</span>
        </Button>
      </div>

      {open ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
                <Input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tên đề thi" />
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Môn học" />
                <Input type="number" min={1} value={duration} onChange={(event) => setDuration(Number(event.target.value))} placeholder="Thời lượng phút" />
              </div>
              <Textarea className="min-h-20" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mô tả" />
              <div className="grid gap-3 md:grid-cols-3">
                <Input type="number" min={0} step={0.25} value={passScore} onChange={(event) => setPassScore(Number(event.target.value))} placeholder="Điểm đạt" />
                <Select value={mode} onValueChange={(value) => setMode(value as Exam["mode"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_AT_ONCE">Hiển thị tất cả</SelectItem>
                    <SelectItem value="ONE_BY_ONE">Từng câu một</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-3 rounded border border-input bg-white px-4 py-3">
                  <Checkbox checked={isPublished} onCheckedChange={(checked) => setIsPublished(Boolean(checked))} />
                  <Label>Public đề thi</Label>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded border border-input bg-white px-4 py-3">
                <Checkbox checked={showAnswerAfter} onCheckedChange={(checked) => setShowAnswerAfter(Boolean(checked))} />
                <Label>Hiển thị đáp án đúng/sai sau khi nộp</Label>
              </div>
              <div className="max-h-72 space-y-2 overflow-auto rounded border border-input bg-white p-2">
                {questions.length === 0 ? <p className="p-2 text-sm text-muted-foreground">Hãy tạo câu hỏi trước.</p> : null}
                {questions.map((question) => (
                  <Label key={question.id} className="flex cursor-pointer items-start gap-3 rounded p-2 hover:bg-accent hover:text-accent-foreground">
                    <Checkbox
                      className="mt-1"
                      checked={selected.has(question.id)}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => new Set(checked ? [...prev, question.id] : [...prev].filter((id) => id !== question.id)))
                      }
                    />
                    <span className="text-sm">
                      {question.content}
                      <span className="ml-2 text-muted-foreground">({question.points} điểm)</span>
                    </span>
                  </Label>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  Đã chọn {selected.size} câu, tổng {totalPoints} điểm.
                </div>
                <Button disabled={selected.size === 0} className="w-full sm:w-auto">
                  <CheckCircle size={18} />
                  {isPublished ? "Xuất bản đề thi" : "Lưu bản nháp"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {exams.map((exam) => (
          <Card key={exam.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-[#202124]">{exam.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {exam.duration} phút · {exam.examItems?.length ?? 0} câu
                  </p>
                </div>
                <Badge variant={exam.isPublished ? "default" : "outline"}>{exam.isPublished ? "Đã xuất bản" : "Bản nháp"}</Badge>
              </div>
              <Button className="mt-4" size="sm" variant="secondary">
                <Eye size={16} />
                Xem trước
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
