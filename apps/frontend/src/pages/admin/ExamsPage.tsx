import { CheckCircle, Eye, Plus, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";
import type { Exam, Page, Question } from "../../types";

export const ExamsPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [passScore, setPassScore] = useState(5);
  const [mode, setMode] = useState<Exam["mode"]>("ALL_AT_ONCE");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = () => void api.get<Page<Exam>>("/exams").then(({ data }) => setExams(data.items));
  useEffect(() => {
    load();
    void api.get<Page<Question>>("/questions", { params: { limit: 100 } }).then(({ data }) => setQuestions(data.items));
  }, []);

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
      duration,
      passScore,
      mode,
      shuffleQuestions: false,
      shuffleOptions: false,
      showResultAfter: true,
      showAnswerAfter: false,
      maxAttempts: 1,
      canGoBack: true,
      isPublished: true,
      items
    });
    toast.success("Exam created");
    setTitle("");
    setDescription("");
    setSelected(new Set());
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Exams</h1>
        <Button className="shrink-0" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          <span className="hidden sm:inline">{open ? "Close" : "New exam"}</span>
        </Button>
      </div>

      {open ? (
        <form onSubmit={submit} className="space-y-3 rounded-md border border-border p-3 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Exam title" />
            <Input type="number" min={1} value={duration} onChange={(event) => setDuration(Number(event.target.value))} placeholder="Duration minutes" />
          </div>
          <textarea
            className="min-h-20 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input type="number" min={0} step={0.25} value={passScore} onChange={(event) => setPassScore(Number(event.target.value))} placeholder="Pass score" />
            <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={mode} onChange={(event) => setMode(event.target.value as Exam["mode"])}>
              <option value="ALL_AT_ONCE">All at once</option>
              <option value="ONE_BY_ONE">One by one</option>
            </select>
          </div>
          <div className="max-h-64 space-y-2 overflow-auto rounded-md border border-border p-2">
            {questions.length === 0 ? <p className="p-2 text-sm text-slate-500 dark:text-slate-400">Create questions first.</p> : null}
            {questions.map((question) => (
              <label key={question.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={selected.has(question.id)}
                  onChange={(event) =>
                    setSelected((prev) => new Set(event.target.checked ? [...prev, question.id] : [...prev].filter((id) => id !== question.id)))
                  }
                />
                <span className="text-sm">{question.content}</span>
              </label>
            ))}
          </div>
          <Button disabled={selected.size === 0} className="w-full sm:w-auto">
            <CheckCircle size={18} />
            Publish exam
          </Button>
        </form>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {exams.map((exam) => (
          <article key={exam.id} className="rounded-md border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">{exam.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{exam.duration} minutes</p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs">{exam.isPublished ? "Published" : "Draft"}</span>
            </div>
            <Button className="mt-4 h-9 bg-slate-900 dark:bg-slate-700">
              <Eye size={16} />
              Preview
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
};
