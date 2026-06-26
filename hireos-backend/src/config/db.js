import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function connectWithRetry(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected");
      return;
    } catch (err) {
      console.error(`❌ DB connect attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }
  console.error("❌ All DB connection attempts failed");
  process.exit(1);
}

// Keep-alive with reconnect
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.log("⚠️ Keep-alive failed, reconnecting...");
    try {
      await prisma.$disconnect();
      await new Promise(r => setTimeout(r, 1000));
      await prisma.$connect();
      console.log("✅ Reconnected");
    } catch (err) {
      console.error("❌ Reconnect failed:", err.message);
    }
  }
}, 4 * 60 * 1000);

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { connectWithRetry };
export default prisma;
