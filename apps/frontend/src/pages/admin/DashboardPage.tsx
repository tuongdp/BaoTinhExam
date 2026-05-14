import { Activity, BookOpen, DoorOpen, FileQuestion, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

interface Stats {
  exams: number;
  questions: number;
  users: number;
  rooms: number;
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void api.get<Stats>("/dashboard/stats").then(({ data }) => setStats(data));
  }, []);

  const cards = [
    { label: "Đề thi", value: stats?.exams, icon: BookOpen },
    { label: "Câu hỏi", value: stats?.questions, icon: FileQuestion },
    { label: "Người dùng", value: stats?.users, icon: Users },
    { label: "Phòng thi", value: stats?.rooms, icon: DoorOpen }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-[#202124]">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">Theo dõi ngân hàng câu hỏi, đề thi, phòng thi và người dùng.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className="text-primary" size={20} />
              </div>
              {card.value == null ? <Skeleton className="mt-4 h-8 w-20" /> : <div className="mt-4 text-3xl font-semibold">{card.value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity size={18} />
            Hoạt động gần đây
          </CardTitle>
          <CardDescription>MVP đã có luồng tạo câu hỏi, tạo đề, mở phòng, làm bài, tự lưu đáp án và chấm trắc nghiệm.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};
