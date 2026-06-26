// src/config/db.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Neon free tier pe DB idle hone ke baad connection drop hoti hai
// Ye function har query se pehle connection alive rakhta hai
async function connectWithRetry(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected");
      return;
    } catch (err) {
      console.error(`❌ DB connect attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, 2000)); // 2s wait
      }
    }
  }
  console.error("❌ All DB connection attempts failed");
}

connectWithRetry();

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;