import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Đã tạo tài khoản");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F9FA] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>Đăng ký tài khoản thí sinh.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Họ và tên" />
            <Input required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
            <Input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu" type="password" />
            <Button disabled={loading} className="w-full">
              <UserPlus size={18} />
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
            <Button asChild variant="link" className="w-full">
              <Link to="/login">Quay lại đăng nhập</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};
