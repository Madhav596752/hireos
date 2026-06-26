// src/modules/messages/messages.controller.js  (REPLACE EXISTING FILE)
//
// FIX: getTeamMembers now returns only users from the same company.
//      Without this, Company A recruiters could message Company B recruiters.
//
import prisma from "../../config/db.js";

function handleError(res, err) {
  return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}

export async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender:   { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const conversationMap = new Map();
    for (const msg of messages) {
      const other = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(other.id)) {
        conversationMap.set(other.id, {
          participant:   other,
          lastMessage:   msg.content,
          lastMessageAt: msg.createdAt,
          unread:        0,
        });
      }
      if (!msg.read && msg.receiverId === userId) {
        conversationMap.get(other.id).unread++;
      }
    }

    res.json(Array.from(conversationMap.values()));
  } catch (err) {
    handleError(res, err);
  }
}

export async function getMessages(req, res) {
  try {
    const userId = req.user.id;
    const { withUserId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId,     receiverId: withUserId },
          { senderId: withUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    await prisma.message.updateMany({
      where: { senderId: withUserId, receiverId: userId, read: false },
      data:  { read: true },
    });

    res.json(messages);
  } catch (err) {
    handleError(res, err);
  }
}

export async function sendMessage(req, res) {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: "receiverId and content are required" });
    }

    // Isolation: can only message someone in the same company (or ADMIN users)
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id }, select: { company: true, role: true } }),
      prisma.user.findUnique({ where: { id: receiverId  }, select: { company: true, role: true, id: true } }),
    ]);

    if (!receiver) return res.status(404).json({ error: "Recipient not found" });

    // Allow if: sender is ADMIN, receiver is ADMIN, or same company
    const sameCompany = sender.company && receiver.company && sender.company === receiver.company;
    const eitherAdmin = sender.role === "ADMIN" || receiver.role === "ADMIN";
    if (!sameCompany && !eitherAdmin) {
      return res.status(403).json({ error: "You can only message teammates in your company." });
    }

    const message = await prisma.message.create({
      data: { senderId: req.user.id, receiverId, content },
      include: {
        sender:   { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json(message);
  } catch (err) {
    handleError(res, err);
  }
}

/**
 * FIX: Only return team members from the same company.
 * ADMIN users are always included (they can talk to everyone).
 */
export async function getTeamMembers(req, res) {
  try {
    const requester = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { company: true, role: true },
    });

    // Build the filter
    const where = {
      id: { not: req.user.id }, // exclude self
      ...(
        // ADMIN sees all users; non-ADMIN sees only their company
        requester.role !== "ADMIN" && requester.company
          ? {
              OR: [
                { company: requester.company },
                { role:    "ADMIN" },          // always include admins
              ],
            }
          : {}
      ),
    };

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, avatarUrl: true, role: true, company: true },
      orderBy: { name: "asc" },
    });

    res.json(users);
  } catch (err) {
    handleError(res, err);
  }
}
