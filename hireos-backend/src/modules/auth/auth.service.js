// src/modules/auth/auth.service.js
import bcrypt from "bcryptjs";
import prisma from "../../config/db.js";
import { signToken } from "../../middleware/auth.js";

export async function register({ name, email, password, company }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: "Email already in use" };

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, company, role: "RECRUITER" },
    select: { id: true, name: true, email: true, role: true, company: true, avatarUrl: true },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  return { user, token };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: "Invalid credentials" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, company: true, avatarUrl: true, createdAt: true },
  });
  if (!user) throw { status: 404, message: "User not found" };
  return user;
}

export async function updateProfile(userId, data) {
  const { name, company, avatarUrl } = data;
  return prisma.user.update({
    where: { id: userId },
    data: { name, company, avatarUrl },
    select: { id: true, name: true, email: true, role: true, company: true, avatarUrl: true },
  });
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw { status: 400, message: "Current password is incorrect" };

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: "Password updated" };
}
