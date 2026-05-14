import { Image, Music, Plus, X } from "lucide-react";
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
import type { Page, Question, QuestionType } from "../../types";

const difficultyLabel: Record<Question["difficulty"], string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó"
};

const questionTypeLabel: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm 1 đáp án",
  MULTIPLE_SELECT: "Trắc nghiệm nhiều đáp án",
  TRUE_FALSE: "Đúng/Sai",
  SHORT_ANSWER: "Trả lời ngắn",
  ESSAY: "Tự luận",
  FILL_IN_BLANK: "Điền khuyết",
  IMAGE_CHOICE: "Nhìn hình trả lời",
  VIDEO_CHOICE: "Video",
  AUDIO_CHOICE: "Nghe audio trả lời"
};

const optionQuestionTypes = new Set<QuestionType>(["MULTIPLE_CHOICE", "MULTIPLE_SELECT", "TRUE_FALSE", "IMAGE_CHOICE", "AUDIO_CHOICE", "VIDEO_CHOICE"]);
const manualQuestionTypes = new Set<QuestionType>(["ESSAY", "SHORT_ANSWER"]);

const makeDefaultOptions = () => [
  { id: "A", text: "" },
  { id: "B", text: "" },
  { id: "C", text: "" },
  { id: "D", text: "" }
];

export const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<QuestionType>("MULTIPLE_CHOICE");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [options, setOptions] = useState(makeDefaultOptions);
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(["A"]);
  const [difficulty, setDifficulty] = useState<Question["difficulty"]>("MEDIUM");
  const [points, setPoints] = useState(1);
  const [topic, setTopic] = useState("Chung");
  const [explanation, setExplanation] = useState("");

  const load = () => void api.get<Page<Question>>("/questions").then(({ data }) => setQuestions(data.items));
  useEffect(load, []);

  const usesOptions = optionQuestionTypes.has(type);
  const mediaType = useMemo(() => {
    if (type === "IMAGE_CHOICE") return "IMAGE";
    if (type === "AUDIO_CHOICE") return "AUDIO";
    if (type === "VIDEO_CHOICE") return "VIDEO";
    return null;
  }, [type]);

  const resetForm = () => {
    setContent("");
    setMediaUrl("");
    setOptions(makeDefaultOptions());
    setCorrectAnswer("A");
    setCorrectAnswers(["A"]);
    setExplanation("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payloadOptions = type === "TRUE_FALSE" ? [{ id: "TRUE", text: "Đúng" }, { id: "FALSE", text: "Sai" }] : options.filter((option) => option.text.trim());
    const answer = type === "MULTIPLE_SELECT" ? correctAnswers : manualQuestionTypes.has(type) ? null : correctAnswer;

    await api.post("/questions", {
      type,
      content,
      mediaUrl: mediaUrl.trim() || null,
      mediaType,
      options: usesOptions ? payloadOptions : null,
      correctAnswer: answer,
      explanation: explanation.trim() || null,
      difficulty,
      points,
      topics: topic.split(",").map((item) => item.trim()).filter(Boolean)
    });
    toast.success("Đã tạo câu hỏi");
    resetForm();
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-[#202124]">Ngân hàng câu hỏi</h1>
          <p className="text-sm text-muted-foreground">Tạo trắc nghiệm, tự luận, câu hỏi kèm ảnh hoặc audio cho đề thi.</p>
        </div>
        <Button className="shrink-0" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          <span className="hidden sm:inline">{open ? "Đóng" : "Thêm câu hỏi"}</span>
        </Button>
      </div>

      {open ? (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_220px_160px]">
                <Select value={type} onValueChange={(value) => setType(value as QuestionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">Trắc nghiệm 1 đáp án</SelectItem>
                    <SelectItem value="MULTIPLE_SELECT">Trắc nghiệm nhiều đáp án</SelectItem>
                    <SelectItem value="ESSAY">Tự luận</SelectItem>
                    <SelectItem value="IMAGE_CHOICE">Nhìn hình trả lời</SelectItem>
                    <SelectItem value="AUDIO_CHOICE">Nghe audio trả lời</SelectItem>
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
                <Input type="number" min={0.25} step={0.25} value={points} onChange={(event) => setPoints(Number(event.target.value))} aria-label="Điểm" />
              </div>

              <Textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Nội dung câu hỏi" />

              {mediaType ? (
                <div className="grid gap-2 md:grid-cols-[1fr_180px]">
                  <Input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder={mediaType === "IMAGE" ? "URL ảnh" : "URL audio/video"} />
                  <Badge variant="outline" className="justify-center rounded">
                    {mediaType === "IMAGE" ? <Image size={16} /> : <Music size={16} />}
                    {mediaType === "IMAGE" ? "Ảnh minh họa" : "Tệp nghe/xem"}
                  </Badge>
                </div>
              ) : null}

              {usesOptions ? (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(type === "TRUE_FALSE" ? [{ id: "TRUE", text: "Đúng" }, { id: "FALSE", text: "Sai" }] : options).map((option, index) => (
                      <Input
                        key={option.id}
                        required
                        disabled={type === "TRUE_FALSE"}
                        value={option.text}
                        onChange={(event) =>
                          setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, text: event.target.value } : item)))
                        }
                        placeholder={`Đáp án ${option.id}`}
                      />
                    ))}
                  </div>
                  {type === "MULTIPLE_SELECT" ? (
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <Label key={option.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded border border-input px-3 py-2">
                          <Checkbox
                            checked={correctAnswers.includes(option.id)}
                            onCheckedChange={(checked) =>
                              setCorrectAnswers((prev) => (checked ? [...new Set([...prev, option.id])] : prev.filter((id) => id !== option.id)))
                            }
                          />
                          Đáp án đúng {option.id}
                        </Label>
                      ))}
                    </div>
                  ) : (
                    <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(type === "TRUE_FALSE" ? [{ id: "TRUE" }, { id: "FALSE" }] : options).map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            Đáp án đúng {option.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Chủ đề, phân tách bằng dấu phẩy" />
                <Input value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Giải thích đáp án (tùy chọn)" />
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
                <Badge>{questionTypeLabel[question.type]}</Badge>
                <Badge variant="outline">{difficultyLabel[question.difficulty]}</Badge>
                <Badge variant="outline">{question.points} điểm</Badge>
                {question.mediaType ? <Badge variant="outline">{question.mediaType}</Badge> : null}
              </div>
              <h2 className="mt-2 font-medium text-[#202124]">{question.content}</h2>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
