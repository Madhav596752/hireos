import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

const cols = [
    {
        title: "Product",
        links: ["Features", "Pricing", "AI Screening", "Integrations", "Changelog"],
    },
    {
        title: "Company",
        links: ["About", "Customers", "Careers", "Press", "Contact"],
    },
    {
        title: "Resources",
        links: ["Docs", "API", "Guides", "Templates", "Status"],
    },
    {
        title: "Legal",
        links: ["Privacy", "Terms", "Security", "DPA", "Cookies"],
    },
];

export default function MarketingFooter() {
    return (
        <footer className="border-t border-border bg-background" data-testid="marketing-footer">
            <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-6 gap-8">
                <div className="col-span-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-display font-bold text-lg">
                            HireOS<span className="text-accent">.</span>
                        </span>
                    </Link>
                    <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                        The AI-native hiring platform built for modern talent teams.
                    </p>
                    <div className="flex items-center gap-3 mt-6">
                        <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="GitHub">
                            <Github className="h-4 w-4" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="Twitter">
                            <Twitter className="h-4 w-4" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground" aria-label="LinkedIn">
                            <Linkedin className="h-4 w-4" />
                        </a>
                    </div>
                </div>

                {cols.map((c) => (
                    <div key={c.title}>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">
                            {c.title}
                        </div>
                        <ul className="space-y-2 text-sm">
                            {c.links.map((l) => (
                                <li key={l}>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-t border-border">
                <div className="mx-auto max-w-7xl px-6 md:px-12 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>© 2026 HireOS, Inc. All rights reserved.</span>
                    <span className="font-mono">v2.4.1 · Built in Berlin & SF</span>
                </div>
            </div>
        </footer>
    );
}
