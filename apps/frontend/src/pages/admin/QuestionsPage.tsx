import { Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { api } from "../../services/api";
import type { Page, Question } from "../../types";

const difficultyLabel: Record<Question["difficulty"], string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó"
};

const questionTypeLabel: Record<Question["type"], string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  MULTIPLE_SELECT: "Chọn nhiều",
  TRUE_FALSE: "Đúng/Sai",
  SHORT_ANSWER: "Trả lời ngắn",
  ESSAY: "Tự luận",
  FILL_IN_BLANK: "Điền khuyết",
  IMAGE_CHOICE: "Chọn ảnh",
  VIDEO_CHOICE: "Chọn video",
  AUDIO_CHOICE: "Chọn âm thanh"
};

const defaultOptions = [
  { id: "A", text: "" },
  { id: "B", text: "" },
  { id: "C", text: "" },
  { id: "D", text: "" }
];

export const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [options, setOptions] = useState(defaultOptions);
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [difficulty, setDifficulty] = useState<Question["difficulty"]>("MEDIUM");
  const [points, setPoints] = useState(1);
  const [topic, setTopic] = useState("Chung");

  const load = () => void api.get<Page<Question>>("/questions").then(({ data }) => setQuestions(data.items));
  useEffect(load, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/questions", {
      type: "MULTIPLE_CHOICE",
      content,
      options,
      correctAnswer,
      difficulty,
      points,
      topics: topic.split(",").map((item) => item.trim()).filter(Boolean)
    });
    toast.success("Đã tạo câu hỏi");
    setContent("");
    setOptions(defaultOptions);
    setCorrectAnswer("A");
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Ngân hàng câu hỏi</h1>
        <Button className="shrink-0" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          <span className="hidden sm:inline">{open ? "Đóng" : "Thêm câu hỏi"}</span>
        </Button>
      </div>

      {open ? (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <form onSubmit={submit} className="space-y-3">
              <Textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nội dung câu hỏi" />
              <div className="grid gap-2 sm:grid-cols-2">
                {options.map((option, index) => (
                  <Input
                    key={option.id}
                    required
                    value={option.text}
                    onChange={(event) => setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, text: event.target.value } : item)))}
                    placeholder={`Đáp án ${option.id}`}
                  />
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        Đáp án đúng {option.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Question["difficulty"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Dễ</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="HARD">Khó</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" min={0.25} step={0.25} value={points} onChange={(event) => setPoints(Number(event.target.value))} />
                <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Chủ đề" />
              </div>
              <Button className="w-full sm:w-auto">
                <Plus size={18} />
                Lưu câu hỏi
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{questionTypeLabel[question.type]}</Badge>
              <Badge variant="outline">{difficultyLabel[question.difficulty]}</Badge>
              <Badge variant="outline">{question.points} điểm</Badge>
            </div>
            <h2 className="mt-2 font-medium">{question.content}</h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
