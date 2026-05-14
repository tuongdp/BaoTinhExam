import { QuestionType, type Exam, type ExamItem, type Question } from "@prisma/client";

type QuestionWithItem = ExamItem & { question: Question };
type ExamWithItems = Exam & { examItems: QuestionWithItem[] };
type Answers = Record<string, unknown>;

const subjective = new Set<QuestionType>([QuestionType.ESSAY, QuestionType.SHORT_ANSWER]);

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();

export const gradeObjective = (exam: ExamWithItems, answers: Answers) => {
  let score = 0;
  let totalPoints = 0;
  const manualItems: { questionId: number }[] = [];

  for (const item of exam.examItems) {
    totalPoints += item.points;
    const question = item.question;
    const answer = answers[String(question.id)];

    if (subjective.has(question.type)) {
      manualItems.push({ questionId: question.id });
      continue;
    }

    if (question.type === QuestionType.MULTIPLE_SELECT) {
      const expected = Array.isArray(question.correctAnswer) ? [...question.correctAnswer].map(String).sort() : [];
      const actual = Array.isArray(answer) ? [...answer].map(String).sort() : [];
      if (JSON.stringify(expected) === JSON.stringify(actual)) score += item.points;
      continue;
    }

    if (question.type === QuestionType.FILL_IN_BLANK && typeof question.correctAnswer === "object" && question.correctAnswer) {
      const expected = question.correctAnswer as Record<string, unknown>;
      const actual = typeof answer === "object" && answer ? (answer as Record<string, unknown>) : {};
      const ok = Object.entries(expected).every(([key, value]) => normalize(actual[key]) === normalize(value));
      if (ok) score += item.points;
      continue;
    }

    if (normalize(answer) === normalize(question.correctAnswer)) score += item.points;
  }

  return { score, totalPoints, manualItems, isPassed: exam.passScore == null ? null : score >= exam.passScore };
};
