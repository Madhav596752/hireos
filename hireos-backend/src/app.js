import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes        from "./modules/auth/auth.routes.js";
import jobsRoutes        from "./modules/jobs/jobs.routes.js";
import candidatesRoutes  from "./modules/candidates/candidates.routes.js";
import screeningRoutes   from "./modules/screening/screening.routes.js";
import messagesRoutes    from "./modules/messages/messages.routes.js";
import dashboardRoutes   from "./modules/dashboard/dashboard.routes.js";
import interviewsRoutes  from "./modules/interviews/interviews.routes.js";

const app = express();
app.set("etag", false);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://recruitement portal.netlify.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many attempts, try again in 15 minutes." },
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/health", (_, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);
app.use("/api/auth",        authRoutes);
app.use("/api/jobs",        jobsRoutes);
app.use("/api/candidates",  candidatesRoutes);
app.use("/api/screening",   screeningRoutes);
app.use("/api/messages",    messagesRoutes);
app.use("/api/dashboard",   dashboardRoutes);
app.use("/api/interviews",  interviewsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});
app.use((err, req, res, next) => {
  console.error("[Unhandled Error]", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║  HireOS Backend  →  :${PORT}            ║
║  ENV: ${(process.env.NODE_ENV || "development").padEnd(27)}║
╚══════════════════════════════════════╝
  `);
});
export default app;
