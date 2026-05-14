import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { api } from "../../services/api";
import type { Submission } from "../../types";

export const ResultPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    void api.get<Submission>(`/submissions/${submissionId}`).then(({ data }) => setSubmission(data));
  }, [submissionId]);

  if (!submission) return <div className="p-6">Loading result...</div>;

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <section className="w-full max-w-md rounded-md border border-border p-6 text-center">
        <h1 className="text-2xl font-semibold">Exam result</h1>
        <div className="my-6 text-5xl font-semibold">
          {submission.score ?? 0}/{submission.totalPoints ?? 0}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manual grading may update this score if the exam includes essay questions.</p>
        <Link to="/exam/join">
          <Button className="mt-6 bg-slate-900 dark:bg-slate-700">
            <RotateCcw size={18} />
            Back to rooms
          </Button>
        </Link>
      </section>
    </main>
  );
};
