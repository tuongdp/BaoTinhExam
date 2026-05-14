import type { Question } from "../../types";
import { Input } from "../ui/input";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}

export const QuestionRenderer = ({ question, value, onChange }: Props) => {
  const selected = Array.isArray(value) ? value.map(String) : [];

  return (
    <div className="space-y-4 rounded-md border border-border p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold leading-6 sm:text-lg">{question.content}</h2>
        <span className="rounded-md bg-muted px-2 py-1 text-sm">{question.points} pts</span>
      </div>
      {question.mediaUrl && question.mediaType === "IMAGE" ? <img className="max-h-80 rounded-md object-contain" src={question.mediaUrl} alt="" /> : null}
      {question.mediaUrl && question.mediaType === "VIDEO" ? <video className="max-h-80 w-full rounded-md" src={question.mediaUrl} controls /> : null}
      {question.mediaUrl && question.mediaType === "AUDIO" ? <audio className="w-full" src={question.mediaUrl} controls /> : null}

      {["MULTIPLE_CHOICE", "TRUE_FALSE", "IMAGE_CHOICE", "VIDEO_CHOICE", "AUDIO_CHOICE"].includes(question.type) ? (
        <div className="grid gap-2">
          {(question.options ?? []).map((option) => (
            <label key={option.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted">
              <input className="h-5 w-5 shrink-0" type="radio" checked={value === option.id} onChange={() => onChange(option.id)} />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
      ) : null}

      {question.type === "MULTIPLE_SELECT" ? (
        <div className="grid gap-2">
          {(question.options ?? []).map((option) => (
            <label key={option.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted">
              <input
                className="h-5 w-5 shrink-0"
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={(event) => onChange(event.target.checked ? [...selected, option.id] : selected.filter((id) => id !== option.id))}
              />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
      ) : null}

      {question.type === "SHORT_ANSWER" || question.type === "FILL_IN_BLANK" ? <Input value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} /> : null}
      {question.type === "ESSAY" ? (
        <textarea className="min-h-40 w-full rounded-md border border-border bg-background p-3 outline-none focus:ring-2 focus:ring-primary" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
      ) : null}
    </div>
  );
};
