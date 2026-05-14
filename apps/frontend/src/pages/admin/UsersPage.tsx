import { Plus, Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { api } from "../../services/api";
import type { Page, Role, User } from "../../types";

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("User@123456");
  const [role, setRole] = useState<Role>("USER");

  useEffect(() => {
    const id = window.setTimeout(() => {
      void api.get<Page<User>>("/users", { params: { search } }).then(({ data }) => setUsers(data.items));
    }, 250);
    return () => window.clearTimeout(id);
  }, [search]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api.post("/users", { name, email, password, role, isActive: true });
    toast.success("User created");
    setName("");
    setEmail("");
    setOpen(false);
    const { data } = await api.get<Page<User>>("/users", { params: { search } });
    setUsers(data.items);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button className="w-full md:w-auto" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          {open ? "Close" : "New user"}
        </Button>
      </div>
      {open ? (
        <form onSubmit={submit} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2 sm:p-4">
          <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
          <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          <select className="h-10 rounded-md border border-border bg-background px-3 text-sm" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
          <Button className="sm:col-span-2">
            <Plus size={18} />
            Create user
          </Button>
        </form>
      ) : null}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5" size={18} />
        <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.isActive ? "Active" : "Disabled"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
