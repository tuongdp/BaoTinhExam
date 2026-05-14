import { Plus, Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../services/api";
import type { Page, Role, User } from "../../types";

const roleLabel: Record<Role, string> = {
  USER: "Thí sinh",
  ADMIN: "Quản trị viên",
  SUPER_ADMIN: "Quản trị cao nhất"
};

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
    toast.success("Đã tạo người dùng");
    setName("");
    setEmail("");
    setOpen(false);
    const { data } = await api.get<Page<User>>("/users", { params: { search } });
    setUsers(data.items);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Người dùng</h1>
        <Button className="w-full md:w-auto" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Plus size={18} />}
          {open ? "Đóng" : "Thêm người dùng"}
        </Button>
      </div>
      {open ? (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
              <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Họ và tên" />
              <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
              <Input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu" />
              <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Thí sinh</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Quản trị cao nhất</SelectItem>
                </SelectContent>
              </Select>
              <Button className="sm:col-span-2">
                <Plus size={18} />
                Tạo người dùng
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5" size={18} />
        <Input className="pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm người dùng" />
      </div>
      <Card>
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{roleLabel[user.role]}</TableCell>
                <TableCell>{user.isActive ? "Đang hoạt động" : "Đã khóa"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
