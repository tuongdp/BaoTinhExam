import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface UserContext {
      id: number;
      role: Role;
      email: string;
    }

    interface Request {
      user?: UserContext;
    }
  }
}

export {};
