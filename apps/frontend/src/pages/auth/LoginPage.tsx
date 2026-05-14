import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";
import { Button } from "../../components/ui/button";
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
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-md border border-border bg-background p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">ExamHub</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage or take exams.</p>
        </div>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
        <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
        <Button disabled={loading} className="w-full">
          <LogIn size={18} />
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <Link className="block text-center text-sm text-primary" to="/register">
          Create candidate account
        </Link>
      </form>
    </main>
  );
};
