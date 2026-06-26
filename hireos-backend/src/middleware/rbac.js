// src/middleware/rbac.js

// Role hierarchy: ADMIN > HR > RECRUITER
const ROLE_WEIGHT = { ADMIN: 3, HR: 2, RECRUITER: 1 };

/**
 * Allow only users with the specified role(s).
 * Usage: router.delete("/jobs/:id", authenticate, rbac("ADMIN", "HR"), controller)
 */
export function rbac(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    const userWeight = ROLE_WEIGHT[req.user.role] ?? 0;
    const allowed = roles.some((r) => ROLE_WEIGHT[r] <= userWeight);

    if (!allowed) {
      return res.status(403).json({
        error: `Forbidden. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
}

/**
 * Convenience shortcuts
 */
export const adminOnly = rbac("ADMIN");
export const hrAndAbove = rbac("ADMIN", "HR");
export const allRoles = rbac("ADMIN", "HR", "RECRUITER");