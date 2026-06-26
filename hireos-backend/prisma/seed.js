// prisma/seed.js — sirf demo user banao, fake data nahi
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPw = await bcrypt.hash("demo1234", 10);

  // Sirf ek demo admin user — koi fake jobs/candidates nahi
  await prisma.user.upsert({
    where: { email: "maya@hireos.io" },
    update: {},
    create: {
      name: "Maya Chen",
      email: "maya@hireos.io",
      password: hashedPw,
      role: "ADMIN",
      company: "HireOS Demo",
    },
  });

  console.log("✅ Seed complete!");
  console.log("👤 Demo login: maya@hireos.io / demo1234");
  console.log("💡 Apna account banana ho toh /signup pe jaao");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });