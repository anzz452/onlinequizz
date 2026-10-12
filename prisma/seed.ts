import { PrismaClient, Role, QuizStatus, AttemptStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Clear existing data (in reverse dependency order)
  await prisma.studentAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned existing records.');

  // Hashes
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const teacherPassword = await bcrypt.hash('Teacher@1234', 10);
  const studentPassword = await bcrypt.hash('Student@1234', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@quizplatform.edu',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      name: 'Prof. Alan Turing',
      email: 'teacher1@quizplatform.edu',
      passwordHash: teacherPassword,
      role: Role.TEACHER,
      isActive: true,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Dr. Ada Lovelace',
      email: 'teacher2@quizplatform.edu',
      passwordHash: teacherPassword,
      role: Role.TEACHER,
      isActive: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'student1@quizplatform.edu',
      passwordHash: studentPassword,
      role: Role.STUDENT,
      isActive: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'student2@quizplatform.edu',
      passwordHash: studentPassword,
      role: Role.STUDENT,
      isActive: true,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'student3@quizplatform.edu',
      passwordHash: studentPassword,
      role: Role.STUDENT,
      isActive: true,
    },
  });

  console.log('Created Users: Admin, 2 Teachers, 3 Students.');

  // 2. Create Quizzes for Teacher 1
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Data Structures & Algorithms Fundamentals',
      description: 'Test your understanding of Big-O complexity, binary search trees, stacks, and hash tables.',
      subject: 'Computer Science',
      durationMinutes: 15,
      totalMarks: 20,
      passingMarks: 12,
      status: QuizStatus.PUBLISHED,
      shuffleQuestions: true,
      showResultsImmediately: true,
      teacherId: teacher1.id,
      questions: {
        create: [
          {
            questionText: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?',
            marks: 4,
            order: 1,
            options: {
              create: [
                { optionText: 'O(1)', isCorrect: false },
                { optionText: 'O(log n)', isCorrect: true },
                { optionText: 'O(n)', isCorrect: false },
                { optionText: 'O(n log n)', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Which data structure operates strictly on a Last-In, First-Out (LIFO) basis?',
            marks: 4,
            order: 2,
            options: {
              create: [
                { optionText: 'Queue', isCorrect: false },
                { optionText: 'Priority Queue', isCorrect: false },
                { optionText: 'Stack', isCorrect: true },
                { optionText: 'Linked List', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'In a Hash Table with separate chaining, what is the worst-case lookup time if all keys hash to the same bucket?',
            marks: 4,
            order: 3,
            options: {
              create: [
                { optionText: 'O(n)', isCorrect: true },
                { optionText: 'O(1)', isCorrect: false },
                { optionText: 'O(log n)', isCorrect: false },
                { optionText: 'O(n^2)', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Which sorting algorithm has a guaranteed worst-case time complexity of O(n log n)?',
            marks: 4,
            order: 4,
            options: {
              create: [
                { optionText: 'Quick Sort', isCorrect: false },
                { optionText: 'Merge Sort', isCorrect: true },
                { optionText: 'Bubble Sort', isCorrect: false },
                { optionText: 'Insertion Sort', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Which graph traversal algorithm uses a Queue data structure?',
            marks: 4,
            order: 5,
            options: {
              create: [
                { optionText: 'Breadth-First Search (BFS)', isCorrect: true },
                { optionText: 'Depth-First Search (DFS)', isCorrect: false },
                { optionText: 'Backtracking', isCorrect: false },
                { optionText: 'Topological Sort with DFS', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Relational Database Management & SQL',
      description: 'Covers ACID properties, normalization levels, indexing techniques, and SQL aggregations.',
      subject: 'Databases',
      durationMinutes: 20,
      totalMarks: 20,
      passingMarks: 12,
      status: QuizStatus.PUBLISHED,
      shuffleQuestions: false,
      showResultsImmediately: true,
      teacherId: teacher1.id,
      questions: {
        create: [
          {
            questionText: 'Which ACID property guarantees that all transactions are processed reliably or none at all?',
            marks: 5,
            order: 1,
            options: {
              create: [
                { optionText: 'Atomicity', isCorrect: true },
                { optionText: 'Consistency', isCorrect: false },
                { optionText: 'Isolation', isCorrect: false },
                { optionText: 'Durability', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Which normal form eliminates transitive functional dependencies on non-prime attributes?',
            marks: 5,
            order: 2,
            options: {
              create: [
                { optionText: 'First Normal Form (1NF)', isCorrect: false },
                { optionText: 'Second Normal Form (2NF)', isCorrect: false },
                { optionText: 'Third Normal Form (3NF)', isCorrect: true },
                { optionText: 'Boyce-Codd Normal Form (BCNF)', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Which SQL clause is used to filter groups created by the GROUP BY statement?',
            marks: 5,
            order: 3,
            options: {
              create: [
                { optionText: 'WHERE', isCorrect: false },
                { optionText: 'HAVING', isCorrect: true },
                { optionText: 'ORDER BY', isCorrect: false },
                { optionText: 'LIMIT', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'What kind of index structure is most commonly utilized by PostgreSQL for primary key B-tree indexing?',
            marks: 5,
            order: 4,
            options: {
              create: [
                { optionText: 'Hash Index', isCorrect: false },
                { optionText: 'B-Tree Index', isCorrect: true },
                { optionText: 'GIN Index', isCorrect: false },
                { optionText: 'GiST Index', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  // 3. Create Draft Quiz for Teacher 2
  await prisma.quiz.create({
    data: {
      title: 'Operating Systems & Concurrency',
      description: 'Explores process scheduling, deadlocks, semaphores, and virtual memory.',
      subject: 'Computer Systems',
      durationMinutes: 30,
      totalMarks: 15,
      passingMarks: 9,
      status: QuizStatus.DRAFT,
      shuffleQuestions: false,
      showResultsImmediately: true,
      teacherId: teacher2.id,
      questions: {
        create: [
          {
            questionText: 'Which of the following is NOT one of Coffman’s four conditions for deadlock?',
            marks: 5,
            order: 1,
            options: {
              create: [
                { optionText: 'Mutual Exclusion', isCorrect: false },
                { optionText: 'Hold and Wait', isCorrect: false },
                { optionText: 'Preemption Allowed', isCorrect: true },
                { optionText: 'Circular Wait', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'What algorithm is commonly used to avoid deadlocks by allocating resources safely?',
            marks: 5,
            order: 2,
            options: {
              create: [
                { optionText: 'Round Robin', isCorrect: false },
                { optionText: 'Banker’s Algorithm', isCorrect: true },
                { optionText: 'Shortest Job First', isCorrect: false },
                { optionText: 'Peterson’s Algorithm', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'In virtual memory, what is the phenomenon called when excessive paging occurs due to lack of RAM?',
            marks: 5,
            order: 3,
            options: {
              create: [
                { optionText: 'Thrashing', isCorrect: true },
                { optionText: 'Fragmentation', isCorrect: false },
                { optionText: 'Segmentation Fault', isCorrect: false },
                { optionText: 'Deadlock', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Created Quizzes with Questions and Options.');

  // 4. Create Sample Attempts & Answers for Quiz 1
  const q1Questions = quiz1.questions;
  const now = new Date();
  const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);

  // Student 1 completed Quiz 1 with 4 correct out of 5 (16 / 20 marks -> Passed)
  const attempt1 = await prisma.quizAttempt.create({
    data: {
      quizId: quiz1.id,
      studentId: student1.id,
      startedAt: thirtyMinsAgo,
      submittedAt: fifteenMinsAgo,
      expiresAt: new Date(thirtyMinsAgo.getTime() + 15 * 60 * 1000),
      score: 16,
      percentage: 80,
      status: AttemptStatus.SUBMITTED,
    },
  });

  for (let i = 0; i < q1Questions.length; i++) {
    const q = q1Questions[i];
    const correctOpt = q.options.find((o) => o.isCorrect);
    const incorrectOpt = q.options.find((o) => !o.isCorrect);

    // Make question 3 incorrect for student 1
    const chosenOpt = i === 2 ? incorrectOpt! : correctOpt!;
    const isAnsCorrect = chosenOpt.id === correctOpt!.id;

    await prisma.studentAnswer.create({
      data: {
        attemptId: attempt1.id,
        questionId: q.id,
        selectedOptionId: chosenOpt.id,
        isCorrect: isAnsCorrect,
        marksAwarded: isAnsCorrect ? q.marks : 0,
      },
    });
  }

  // Student 2 completed Quiz 1 with 2 correct out of 5 (8 / 20 marks -> Failed)
  const attempt2 = await prisma.quizAttempt.create({
    data: {
      quizId: quiz1.id,
      studentId: student2.id,
      startedAt: thirtyMinsAgo,
      submittedAt: fifteenMinsAgo,
      expiresAt: new Date(thirtyMinsAgo.getTime() + 15 * 60 * 1000),
      score: 8,
      percentage: 40,
      status: AttemptStatus.SUBMITTED,
    },
  });

  for (let i = 0; i < q1Questions.length; i++) {
    const q = q1Questions[i];
    const correctOpt = q.options.find((o) => o.isCorrect);
    const incorrectOpt = q.options.find((o) => !o.isCorrect);

    // Questions 0 and 1 correct, others incorrect
    const chosenOpt = i < 2 ? correctOpt! : incorrectOpt!;
    const isAnsCorrect = chosenOpt.id === correctOpt!.id;

    await prisma.studentAnswer.create({
      data: {
        attemptId: attempt2.id,
        questionId: q.id,
        selectedOptionId: chosenOpt.id,
        isCorrect: isAnsCorrect,
        marksAwarded: isAnsCorrect ? q.marks : 0,
      },
    });
  }

  console.log('Created Sample Completed Attempts for Student 1 and Student 2.');
  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

