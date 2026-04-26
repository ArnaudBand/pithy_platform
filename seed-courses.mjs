#!/usr/bin/env node
/**
 * seed-courses.mjs
 *
 * Seeds the database with sample courses and lessons (including YouTube videos).
 *
 * Usage:
 *   node seed-courses.mjs --email admin@example.com --password yourpassword
 *
 * The script will:
 *   1. Log in as admin to get a JWT token
 *   2. Create 3 courses (Web Dev, Financial Literacy, Career Development)
 *   3. Create all lessons for each course
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const ADMIN_EMAIL    = get("--email")    || process.env.ADMIN_EMAIL    || "";
const ADMIN_PASSWORD = get("--password") || process.env.ADMIN_PASSWORD || "";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "❌  Missing credentials.\n" +
    "    Usage: node seed-courses.mjs --email <email> --password <password>"
  );
  process.exit(1);
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function api(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const COURSES = [
  // ── 1. Web Development ─────────────────────────────────────────────────────
  {
    course: {
      title: "Introduction to Web Development",
      description:
        "Learn the foundations of the web: HTML, CSS, and JavaScript. Build your first interactive webpage from scratch. No prior experience needed.",
      price: 0,
      currency: "USD",
    },
    lessons: [
      {
        title: "What is the Web?",
        description: "A high-level overview of how the internet and the web work.",
        overview:
          "In this lesson we cover what the internet is, what a browser does, how HTTP requests work, and the difference between a web server and a web client. By the end you'll understand what happens when you type a URL into your browser and how data travels across the globe in milliseconds.",
        videoUrl: "https://www.youtube.com/watch?v=7_LPdttKXPc",
        durationMinutes: 5,
        orderIndex: 0,
        isFree: true,
      },
      {
        title: "HTML Fundamentals",
        description: "Learn the building blocks of every webpage.",
        overview:
          "We cover HTML tags, semantic elements (header, main, footer, article), attributes, links, images, and forms. You'll learn how to structure a complete webpage and understand what makes HTML 'semantic'. By the end of this lesson you'll have built your first full HTML page from scratch.",
        videoUrl: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
        durationMinutes: 20,
        orderIndex: 1,
        isFree: false,
      },
      {
        title: "Styling with CSS",
        description: "Make your pages look great using CSS.",
        overview:
          "Covers selectors, the box model, flexbox, colors, fonts, and responsive design with media queries. We build on the HTML page from the previous lesson and make it visually polished. You'll understand why websites look the way they do and how to control every visual detail.",
        videoUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
        durationMinutes: 25,
        orderIndex: 2,
        isFree: false,
      },
      {
        title: "JavaScript Basics",
        description: "Add interactivity to your pages.",
        overview:
          "Variables, data types, functions, DOM manipulation, and event listeners — the four pillars of browser JavaScript. We add a live character counter and a dark-mode toggle to our project page, so you can see your code respond to real user actions.",
        videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        durationMinutes: 30,
        orderIndex: 3,
        isFree: false,
      },
    ],
  },

  // ── 2. Financial Literacy ───────────────────────────────────────────────────
  {
    course: {
      title: "Financial Literacy 101",
      description:
        "Master the money skills nobody teaches in school — budgeting, debt, investing, and building long-term wealth from the ground up.",
      price: 29,
      currency: "USD",
    },
    lessons: [
      {
        title: "Why Financial Literacy Matters",
        description: "Understand why managing your money is the most important life skill.",
        overview:
          "We look at real statistics on debt, savings rates, and wealth inequality and discuss how financial ignorance compounds over time just like interest. This lesson sets the motivation for everything that follows — and challenges some common money myths most people believe.",
        videoUrl: "https://www.youtube.com/watch?v=p7HKvqRI_Bo",
        durationMinutes: 12,
        orderIndex: 0,
        isFree: true,
      },
      {
        title: "Budgeting with the 50/30/20 Rule",
        description: "A simple, proven framework for allocating your income.",
        overview:
          "50% needs, 30% wants, 20% savings and debt repayment. We walk through real-life examples for different income levels, build a sample monthly budget together, and discuss the most common mistakes people make when they first start budgeting (and how to avoid them).",
        videoUrl: "https://www.youtube.com/watch?v=HQzoZfc3GwQ",
        durationMinutes: 18,
        orderIndex: 1,
        isFree: false,
      },
      {
        title: "Understanding Interest and Debt",
        description: "How compound interest works for you — and against you.",
        overview:
          "Covers simple vs compound interest, APR vs APY, why credit card minimum payments are a trap, student loan mechanics, and the two main debt payoff strategies — the snowball (smallest balance first) and the avalanche (highest interest first). We run the numbers on both.",
        videoUrl: "https://www.youtube.com/watch?v=Rm6UdfRs3gw",
        durationMinutes: 22,
        orderIndex: 2,
        isFree: false,
      },
      {
        title: "Saving vs Investing — What is the Difference?",
        description: "Why keeping money in a savings account is not enough.",
        overview:
          "We explain inflation risk, emergency funds, high-yield savings accounts, and why long-term wealth requires investing — not just saving. We compare savings accounts, index funds, ETFs, and retirement accounts, and show how starting 10 years earlier can double your final wealth.",
        videoUrl: "https://www.youtube.com/watch?v=fVsMHZoqbgs",
        durationMinutes: 20,
        orderIndex: 3,
        isFree: false,
      },
    ],
  },

  // ── 3. Career Development ───────────────────────────────────────────────────
  {
    course: {
      title: "Career Development Masterclass",
      description:
        "Go from unclear career direction to landing your ideal job — goal-setting, CV writing, interview preparation, and professional networking.",
      price: 49,
      currency: "USD",
    },
    lessons: [
      {
        title: "Defining Your Career Goals",
        description: "Clarity before action — figure out where you actually want to go.",
        overview:
          "We use the Ikigai framework and a SWOT self-assessment to help you identify your strengths, interests, market demand, and values. You will leave this lesson with a written 1-year career goal that is specific, measurable, and grounded in who you actually are.",
        videoUrl: "https://www.youtube.com/watch?v=qp0HIF3SfI4",
        durationMinutes: 18,
        orderIndex: 0,
        isFree: true,
      },
      {
        title: "Writing a CV That Gets Interviews",
        description: "The exact format and language hiring managers want to see.",
        overview:
          "Covers the one-page rule, action verbs, quantifying achievements, ATS-friendly formatting, and what to put in each section. We do a before-and-after CV teardown — the same candidate with a weak CV and a strong one — and explain exactly what changed and why.",
        videoUrl: "https://www.youtube.com/watch?v=y8YH0Qbu5h4",
        durationMinutes: 20,
        orderIndex: 1,
        isFree: false,
      },
      {
        title: "Acing the Job Interview",
        description: "Walk in prepared — walk out with an offer.",
        overview:
          "The STAR method for behavioural questions, how to research a company effectively, what to do in the first 60 seconds of an interview, and the three questions you should always ask at the end. Includes a mock Q&A session on the 10 most common interview questions.",
        videoUrl: "https://www.youtube.com/watch?v=KIiypqB_P7Q",
        durationMinutes: 25,
        orderIndex: 2,
        isFree: false,
      },
      {
        title: "Networking Without Feeling Awkward",
        description: "Build real professional relationships — online and offline.",
        overview:
          "LinkedIn profile optimisation, how to cold-message someone without being spammy, running effective informational interviews, and following up after networking events. Includes copy-paste message templates you can personalise immediately.",
        videoUrl: "https://www.youtube.com/watch?v=NHJGnz8YBeo",
        durationMinutes: 18,
        orderIndex: 3,
        isFree: false,
      },
    ],
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🌱  Pithy Means course seeder`);
  console.log(`   Backend → ${BASE_URL}\n`);

  // 1. Login
  process.stdout.write("🔐  Logging in as admin... ");
  let token;
  try {
    const loginRes = await api("POST", "/api/users/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    token = loginRes.token;
    console.log("✅");
  } catch (err) {
    console.log("❌");
    console.error(`   ${err.message}`);
    process.exit(1);
  }

  // 2. Create each course + its lessons
  let totalLessons = 0;
  for (const { course, lessons } of COURSES) {
    process.stdout.write(`\n📚  Creating course "${course.title}"... `);
    let createdCourse;
    try {
      createdCourse = await api("POST", "/api/courses", course, token);
      console.log(`✅  (id: ${createdCourse.id})`);
    } catch (err) {
      console.log("❌");
      console.error(`   ${err.message}`);
      continue;
    }

    for (const lesson of lessons) {
      process.stdout.write(
        `   └─ Lesson ${lesson.orderIndex + 1}: "${lesson.title}"... `
      );
      try {
        await api(
          "POST",
          "/api/lessons",
          { ...lesson, courseId: createdCourse.id },
          token
        );
        console.log("✅");
        totalLessons++;
      } catch (err) {
        console.log("❌");
        console.error(`      ${err.message}`);
      }
    }
  }

  console.log(
    `\n🎉  Done! Created ${COURSES.length} courses and ${totalLessons} lessons.\n`
  );
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
