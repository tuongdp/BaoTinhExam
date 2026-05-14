import { Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";
import type { Page, Question } from "../../types";

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
  const [topic, setTopic] = useState("General");

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
    toast.success("Question created");
    setContent("");
    setOptions(defaultOptions);
    setCorrectAnswer("A");
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Question Bank</h1>
        <Button className="shrink-0" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          <span className="hidden sm:inline">{open ? "Close" : "New question"}</span>
        </Button>
      </div>

      {open ? (
        <form onSubmit={submit} className="space-y-3 rounded-md border border-border p-3 sm:p-4">
          <textarea
            required
            className="min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Question content"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((option, index) => (
              <Input
                key={option.id}
                required
                value={option.text}
                onChange={(event) => setOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, text: event.target.value } : item)))}
                placeholder={`Option ${option.id}`}
              />
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={correctAnswer} onChange={(event) => setCorrectAnswer(event.target.value)}>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  Correct {option.id}
                </option>
              ))}
            </select>
            <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={difficulty} onChange={(event) => setDifficulty(event.target.value as Question["difficulty"])}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <Input type="number" min={0.25} step={0.25} value={points} onChange={(event) => setPoints(Number(event.target.value))} />
            <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Topics" />
          </div>
          <Button className="w-full sm:w-auto">
            <Plus size={18} />
            Save question
          </Button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {questions.map((question) => (
          <article key={question.id} className="rounded-md border border-border p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{question.type}</span>
              <span>{question.difficulty}</span>
              <span>{question.points} pts</span>
            </div>
            <h2 className="mt-2 font-medium">{question.content}</h2>
          </article>
        ))}
      </div>
    </div>
  );
};
