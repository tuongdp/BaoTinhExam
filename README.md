# ExamHub

Nền tảng thi trực tuyến full-stack, gồm:

- Giao diện: React, Vite, TypeScript, Tailwind CSS, shadcn UI/Radix UI
- Máy chủ API: Node.js, Express, Prisma, Socket.io
- Cơ sở dữ liệu: MySQL
- Xác thực: JWT access token và refresh token

## Chạy local

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
npm install
docker compose up -d
npm run db:migrate
npm run seed
npm run dev
```

Nếu dev server báo port `4000` hoặc `5173` đang được dùng, dừng tiến trình cũ rồi chạy lại:

```bash
npm run dev:stop
npm run dev
```

Mở ứng dụng:

- Giao diện: `http://localhost:5173`
- Kiểm tra API: `http://localhost:4000/health`

Nếu dùng MySQL XAMPP mặc định, `root` thường không có mật khẩu. Khi đó đặt:

```text
DATABASE_URL=mysql://root@127.0.0.1:3306/examhub
```

Tài khoản quản trị mặc định sau khi seed:

- Email: `admin@examhub.local`
- Mật khẩu: `Admin@123456`

## Cấu trúc

```text
apps/
  backend/
  frontend/
```

## Biến môi trường

Máy chủ API cần các biến sau:

```text
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://user:password@host:3306/database
CLIENT_URL=https://ten-frontend-cua-ban
CLIENT_URLS=https://ten-frontend-cua-ban,http://localhost:5173
JWT_ACCESS_SECRET=chuoi-bi-mat-dai-it-nhat-16-ky-tu
JWT_REFRESH_SECRET=chuoi-bi-mat-khac-dai-it-nhat-16-ky-tu
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_DAYS=7
UPLOAD_DIR=uploads
```

Giao diện cần:

```text
VITE_API_URL=https://ten-backend-cua-ban/api
VITE_SOCKET_URL=https://ten-backend-cua-ban
```

## Deploy Railway

Railway là lựa chọn gọn nhất nếu bạn dùng MySQL trên cùng nền tảng.

1. Tạo project Railway mới.
2. Thêm dịch vụ MySQL.
3. Thêm một service cho backend từ GitHub repo.
4. Thêm một service cho frontend từ cùng GitHub repo.

Dịch vụ API:

```text
Root Directory: /apps/backend
Config File Path: /apps/backend/railway.json
```

Biến môi trường API:

```text
NODE_ENV=production
DATABASE_URL=${{ MySQL.MYSQL_URL }}
CLIENT_URL=https://your-frontend.up.railway.app
CLIENT_URLS=https://your-frontend.up.railway.app,http://localhost:5173
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_DAYS=7
UPLOAD_DIR=uploads
```

Dịch vụ giao diện:

```text
Root Directory: /apps/frontend
Config File Path: /apps/frontend/railway.json
```

Biến môi trường giao diện:

```text
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_SOCKET_URL=https://your-backend.up.railway.app
```

Sau khi API deploy thành công, mở shell của dịch vụ API và chạy seed nếu cần:

```bash
npm run seed
```

Kiểm tra API:

```text
https://your-backend.up.railway.app/health
```

Kết quả đúng:

```json
{"ok":true}
```

## Deploy Render + Vercel

Mô hình khuyến nghị:

- API chạy trên Render.
- Giao diện chạy trên Vercel.
- Cơ sở dữ liệu dùng MySQL ngoài, ví dụ Railway MySQL, PlanetScale hoặc dịch vụ MySQL tương thích.

Lưu ý quan trọng: schema Prisma hiện dùng `provider = "mysql"`, nên không dùng trực tiếp Render PostgreSQL database.

### API trên Render

Repo đã có `render.yaml`. Khi tạo Blueprint hoặc Web Service, cấu hình:

```text
Thư mục gốc: apps/backend
Lệnh build: npm install && npm run prisma:generate && npm run build && npm run prisma:deploy
Lệnh chạy: npm start
Đường dẫn kiểm tra sức khỏe: /health
```

Đặt biến môi trường API giống phần trên, đặc biệt:

```text
DATABASE_URL=mysql://user:password@host:3306/database
CLIENT_URL=https://your-vercel-app.vercel.app
CLIENT_URLS=https://your-vercel-app.vercel.app,http://localhost:5173
```

### Giao diện trên Vercel

Repo đã có `vercel.json`. Vercel sẽ build frontend bằng:

```text
npm run build -w apps/frontend
```

Đặt biến môi trường frontend trên Vercel:

```text
VITE_API_URL=https://your-render-api.onrender.com/api
VITE_SOCKET_URL=https://your-render-api.onrender.com
```

Sau khi Vercel cấp domain thật, cập nhật `CLIENT_URL` và `CLIENT_URLS` ở API rồi redeploy API.

## Ghi chú production

- Thư mục `uploads` trên Render/Railway có thể bị mất khi redeploy nếu không cấu hình persistent disk. Với production thật, nên chuyển upload sang S3, Cloudinary hoặc dịch vụ tương tự.
- Script `db:deploy` hiện dùng `prisma db push` để deploy nhanh. Khi dự án ổn định, nên tạo Prisma migration và chuyển sang `prisma migrate deploy`.
- Frontend đã chia chunk vendor trong Vite để bundle dễ cache hơn khi deploy.
