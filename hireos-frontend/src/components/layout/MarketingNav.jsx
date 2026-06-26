import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles } from "lucide-react";

const links = [
    { to: "/", label: "Product" },
    { to: "/pricing", label: "Pricing" },
    { to: "/#features", label: "Features" },
    { to: "/#customers", label: "Customers" },
];

export default function MarketingNav() {
    return (
        <header
            className="sticky top-0 z-40 w-full border-b border-border glass"
            data-testid="marketing-nav"
        >
            <div className="mx-auto max-w-7xl px-6 md:px-12 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
                    <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight">
                        HireOS<span className="text-accent">.</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            className={({ isActive }) =>
                                `text-muted-foreground hover:text-foreground transition-colors ${
                                    isActive ? "text-foreground" : ""
                                }`
                            }
                            data-testid={`nav-${l.label.toLowerCase()}`}
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link to="/login" className="hidden sm:inline-flex">
                        <Button variant="ghost" size="sm" data-testid="nav-login-btn">
                            Sign in
                        </Button>
                    </Link>
                    <Link to="/signup">
                        <Button size="sm" data-testid="nav-signup-btn">
                            Start free
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
