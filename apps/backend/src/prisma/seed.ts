import bcrypt from "bcryptjs";
import { Difficulty, QuestionType, Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const main = async () => {
  const password = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@examhub.local" },
    update: {},
    create: {
      email: "admin@examhub.local",
      name: "ExamHub Admin",
      password,
      role: Role.SUPER_ADMIN
    }
  });

  const topic = await prisma.topic.upsert({
    where: { name: "General Knowledge" },
    update: {},
    create: { name: "General Knowledge" }
  });

  const existingQuestion = await prisma.question.findFirst({
    where: { content: "Which HTTP status code means Unauthorized?" }
  });

  const question =
    existingQuestion ??
    (await prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_CHOICE,
        content: "Which HTTP status code means Unauthorized?",
        options: [
          { id: "A", text: "200" },
          { id: "B", text: "401" },
          { id: "C", text: "404" },
          { id: "D", text: "500" }
        ],
        correctAnswer: "B",
        explanation: "401 indicates the request lacks valid authentication credentials.",
        difficulty: Difficulty.EASY,
        points: 1,
        createdById: admin.id,
        topics: { connect: { id: topic.id } }
      }
    }));

  const existingExam = await prisma.exam.findFirst({ where: { title: "Sample Exam" } });
  const exam =
    existingExam ??
    (await prisma.exam.create({
      data: {
        title: "Sample Exam",
        description: "Seeded exam for smoke testing.",
        duration: 30,
        passScore: 1,
        isPublished: true,
        createdById: admin.id,
        examItems: { create: { questionId: question.id, order: 1, points: 1 } }
      }
    }));

  await prisma.examRoom.upsert({
    where: { code: "ABC123" },
    update: { examId: exam.id },
    create: { name: "Sample Room", code: "ABC123", examId: exam.id }
  });
};

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
