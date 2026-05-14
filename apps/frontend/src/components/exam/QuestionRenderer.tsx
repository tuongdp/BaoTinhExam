import type { Question } from "../../types";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}

export const QuestionRenderer = ({ question, value, onChange }: Props) => {
  const selected = Array.isArray(value) ? value.map(String) : [];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-4">
        <CardTitle className="text-base leading-6 sm:text-lg">{question.content}</CardTitle>
        <Badge variant="outline" className="shrink-0">
          {question.points} điểm
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        {question.mediaUrl && question.mediaType === "IMAGE" ? <img className="max-h-80 rounded object-contain" src={question.mediaUrl} alt="" /> : null}
        {question.mediaUrl && question.mediaType === "VIDEO" ? <video className="max-h-80 w-full rounded" src={question.mediaUrl} controls /> : null}
        {question.mediaUrl && question.mediaType === "AUDIO" ? <audio className="w-full" src={question.mediaUrl} controls /> : null}

        {["MULTIPLE_CHOICE", "TRUE_FALSE", "IMAGE_CHOICE", "VIDEO_CHOICE", "AUDIO_CHOICE"].includes(question.type) ? (
          <RadioGroup value={typeof value === "string" ? value : ""} onValueChange={onChange}>
            {(question.options ?? []).map((option) => (
              <Label key={option.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded border border-input bg-white p-3 hover:bg-accent hover:text-accent-foreground">
                <RadioGroupItem value={option.id} />
                <span>{option.text}</span>
              </Label>
            ))}
          </RadioGroup>
        ) : null}

        {question.type === "MULTIPLE_SELECT" ? (
          <div className="grid gap-2">
            {(question.options ?? []).map((option) => (
              <Label key={option.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded border border-input bg-white p-3 hover:bg-accent hover:text-accent-foreground">
                <Checkbox
                  checked={selected.includes(option.id)}
                  onCheckedChange={(checked) => onChange(checked ? [...selected, option.id] : selected.filter((id) => id !== option.id))}
                />
                <span>{option.text}</span>
              </Label>
            ))}
          </div>
        ) : null}

        {question.type === "SHORT_ANSWER" || question.type === "FILL_IN_BLANK" ? <Input value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} /> : null}
        {question.type === "ESSAY" ? <Textarea className="min-h-40" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} /> : null}
      </CardContent>
    </Card>
  );
};
