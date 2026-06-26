import { NavLink, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    ScanSearch,
    CalendarDays,
    MessageSquare,
    Settings as SettingsIcon,
    Sparkles,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/jobs", label: "Jobs", icon: Briefcase },
    { to: "/app/candidates", label: "Candidates", icon: Users },
    { to: "/app/screening", label: "AI Screening", icon: ScanSearch },
    { to: "/app/scheduler", label: "Scheduler", icon: CalendarDays },
    { to: "/app/messages", label: "Messages", icon: MessageSquare },
    { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ mobileOpen, onClose }) {
    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col transition-transform lg:translate-x-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                )}
                data-testid="dashboard-sidebar"
            >
                <div className="h-16 flex items-center justify-between px-5 border-b border-border">
                    <Link to="/app/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-display font-bold text-lg">
                            HireOS<span className="text-accent">.</span>
                        </span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-3 mb-3">
                        Workspace
                    </div>
                    {items.map((it) => (
                        <NavLink
                            key={it.to}
                            to={it.to}
                            onClick={onClose}
                            data-testid={`sidebar-${it.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                                    isActive
                                        ? "bg-secondary text-foreground font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                                )
                            }
                        >
                            <it.icon className="h-4 w-4" />
                            <span>{it.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3">
                    <div className="rounded-lg border border-border p-4 bg-secondary/50">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-1">
                            Upgrade
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Unlock unlimited AI screening & custom models.
                        </p>
                        <Link to="/pricing">
                            <Button size="sm" className="w-full" data-testid="sidebar-upgrade-btn">
                                See plans
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
