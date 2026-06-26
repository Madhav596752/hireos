import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function connectWithRetry(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected");
      return;
    } catch (err) {
      console.error(`❌ DB connect attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }
  console.error("❌ All DB connection attempts failed");
  process.exit(1); // ← added: fatal error pe exit karo
}

// Neon ko har 4 minute mein ping karo
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.log("⚠️ Keep-alive ping failed, reconnecting...");
    await connectWithRetry();
  }
}, 4 * 60 * 1000);

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { connectWithRetry };
export default prisma;
