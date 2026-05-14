export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_SELECT"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY"
  | "FILL_IN_BLANK"
  | "IMAGE_CHOICE"
  | "VIDEO_CHOICE"
  | "AUDIO_CHOICE";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
  isActive?: boolean;
}

export interface Topic {
  id: number;
  name: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  mediaUrl?: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  content: string;
  mediaUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | "AUDIO" | null;
  options?: QuestionOption[] | null;
  correctAnswer?: unknown;
  explanation?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  topics?: Topic[];
}

export interface ExamItem {
  id: number;
  order: number;
  points: number;
  question: Question;
}

export interface Exam {
  id: number;
  title: string;
  description?: string | null;
  duration: number;
  mode: "ONE_BY_ONE" | "ALL_AT_ONCE";
  canGoBack: boolean;
  showAnswerAfter: boolean;
  isPublished: boolean;
  examItems: ExamItem[];
}

export interface ExamRoom {
  id: number;
  code: string;
  name: string;
  status: "WAITING" | "IN_PROGRESS" | "ENDED";
  exam: Exam;
}

export interface Submission {
  id: number;
  roomId: number;
  userId: number;
  answers: Record<string, unknown>;
  score?: number | null;
  totalPoints?: number | null;
  submittedAt?: string | null;
}

export interface Page<T> {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
