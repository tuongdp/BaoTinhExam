import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
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
      toast.success("Account created");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-muted/35 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-md border border-border bg-background p-5 shadow-sm sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Register as a candidate.</p>
        </div>
        <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
        <Input required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
        <Input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
        <Button disabled={loading} className="w-full">
          <UserPlus size={18} />
          {loading ? "Creating..." : "Create account"}
        </Button>
        <Link className="block text-center text-sm text-primary" to="/login">
          Back to sign in
        </Link>
      </form>
    </main>
  );
};
