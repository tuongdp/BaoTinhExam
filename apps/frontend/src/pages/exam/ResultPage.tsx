import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { api } from "../../services/api";
import type { Submission } from "../../types";

export const ResultPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    void api.get<Submission>(`/submissions/${submissionId}`).then(({ data }) => setSubmission(data));
  }, [submissionId]);

  if (!submission) return <div className="p-6">Đang tải kết quả...</div>;

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F9FA] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Kết quả bài thi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 text-5xl font-semibold text-[#202124]">
            {submission.score ?? 0}/{submission.totalPoints ?? 0}
          </div>
          <CardDescription>Điểm có thể được cập nhật sau khi giáo viên chấm câu tự luận.</CardDescription>
          <Button asChild className="mt-6" variant="secondary">
            <Link to="/exam/join">
              <RotateCcw size={18} />
              Quay lại phòng thi
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};
