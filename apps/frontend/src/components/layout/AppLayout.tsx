import { BarChart3, BookOpen, DoorOpen, FileQuestion, Home, LogOut, Moon, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { Button } from "../ui/button";

const links = [
  { to: "/admin", label: "Tổng quan", icon: BarChart3 },
  { to: "/admin/users", label: "Người dùng", icon: Users },
  { to: "/admin/questions", label: "Câu hỏi", icon: FileQuestion },
  { to: "/admin/exams", label: "Đề thi", icon: BookOpen },
  { to: "/admin/rooms", label: "Phòng thi", icon: DoorOpen }
];

export const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-muted/35 p-4 lg:block">
        <div className="mb-6 text-xl font-semibold">ExamHub</div>
        <nav className="space-y-1">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-sm text-muted-foreground">Đang đăng nhập</p>
            <p className="max-w-[180px] truncate font-medium sm:max-w-none">{user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => document.documentElement.classList.toggle("dark")} title="Đổi giao diện">
              <Moon size={18} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={18} />
              Đăng xuất
            </Button>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-background/95 px-1 py-2 backdrop-blur lg:hidden">
        {[
          { to: "/admin", label: "Tổng quan", icon: Home },
          { to: "/admin/users", label: "Người dùng", icon: Users },
          { to: "/admin/questions", label: "Ngân hàng", icon: FileQuestion },
          { to: "/admin/exams", label: "Đề thi", icon: BookOpen },
          { to: "/admin/rooms", label: "Phòng thi", icon: DoorOpen }
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] ${isActive ? "text-primary" : "text-muted-foreground"}`
            }
          >
            <item.icon size={20} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
