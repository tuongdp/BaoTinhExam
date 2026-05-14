import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export const LoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("admin@examhub.local");
  const [password, setPassword] = useState("Admin@123456");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setSession(data);
      navigate(data.user.role === "USER" ? "/exam/join" : "/admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-muted/35 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">ExamHub</CardTitle>
          <CardDescription>Đăng nhập để quản lý hoặc làm bài thi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu" type="password" />
            <Button disabled={loading} className="w-full">
              <LogIn size={18} />
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <Button asChild variant="link" className="w-full">
              <Link to="/register">Tạo tài khoản thí sinh</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};
