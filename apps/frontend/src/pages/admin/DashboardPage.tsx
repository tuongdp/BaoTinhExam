import { Activity, BookOpen, DoorOpen, FileQuestion, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Skeleton } from "../../components/ui/skeleton";

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
    { label: "Exams", value: stats?.exams, icon: BookOpen },
    { label: "Questions", value: stats?.questions, icon: FileQuestion },
    { label: "Users", value: stats?.users, icon: Users },
    { label: "Rooms", value: stats?.rooms, icon: DoorOpen }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">System overview and live exam operations.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">{card.label}</span>
              <card.icon size={20} />
            </div>
            {card.value == null ? <Skeleton className="mt-4 h-8 w-20" /> : <div className="mt-4 text-3xl font-semibold">{card.value}</div>}
          </div>
        ))}
      </div>
      <section className="rounded-md border border-border p-4">
        <div className="mb-3 flex items-center gap-2 font-medium">
          <Activity size={18} />
          Recent activity
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Activity API is ready for submissions and rooms.</p>
      </section>
    </div>
  );
};
