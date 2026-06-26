import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Sparkles,
    ScanSearch,
    Users,
    Zap,
    Shield,
    BarChart3,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { LOGOS, TESTIMONIALS, FAQ, PRICING_PLANS } from "@/data/dummy";

const features = [
    {
        icon: ScanSearch,
        title: "AI Resume Screening",
        body: "Rank candidates against any JD in seconds with a tuned embedding model that understands trajectory, not just keywords.",
    },
    {
        icon: Users,
        title: "Unified Pipeline",
        body: "A drag-and-drop pipeline that finally feels as fast as your team. Multi-stage, multi-role, multi-everything.",
    },
    {
        icon: Zap,
        title: "One-click Scheduling",
        body: "Send polished interview invites and sync calendars with Google, Microsoft and Zoom — natively.",
    },
    {
        icon: BarChart3,
        title: "Hiring Analytics",
        body: "Track funnel, time-to-hire, source quality and DEI metrics with dashboards that don't suck.",
    },
    {
        icon: Shield,
        title: "Enterprise-grade",
        body: "SOC 2 Type II, SSO/SAML, RBAC, audit logs and a 99.99% SLA on Enterprise.",
    },
    {
        icon: Sparkles,
        title: "Built for AI",
        body: "Every workflow is augmented — not replaced — by AI. Your recruiters stay in the loop.",
    },
];

export default function Landing() {
    return (
        <div data-testid="landing-page">
            {/* HERO */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none" />
                <div className="mx-auto max-w-7xl px-6 md:px-12 py-20 md:py-32 grid lg:grid-cols-12 gap-12 items-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7"
                    >
                        <Badge variant="outline" className="mb-6 font-mono text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-success mr-2 animate-pulse" />
                            Now with custom AI models · v2.4
                        </Badge>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tighter leading-[1.05]">
                            Hire the
                            <span className="text-accent"> right </span>
                            person in
                            <br />
                            half the time.
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                            HireOS is the AI-native ATS for modern talent teams. Screen, schedule
                            and hire from a single, ridiculously fast workspace your recruiters
                            will actually enjoy using.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Link to="/signup">
                                <Button size="lg" className="group" data-testid="hero-cta-primary">
                                    Start free 14-day trial
                                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link to="/app/dashboard">
                                <Button size="lg" variant="outline" data-testid="hero-cta-secondary">
                                    See live demo
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground font-mono">
                            <span>★ 4.9 on G2 (412)</span>
                            <span>SOC 2 Type II</span>
                            <span>No card required</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="lg:col-span-5"
                    >
                        <div className="relative rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/10">
                            <div className="h-9 border-b border-border bg-secondary/60 px-3 flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                                <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
                                <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
                                <span className="ml-3 text-xs font-mono text-muted-foreground">
                                    hireos.io/app/dashboard
                                </span>
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-3 bg-background">
                                {["Applicants", "Interviews", "Hires", "TTH"].map((l, i) => (
                                    <div key={l} className="rounded-md border border-border p-4">
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                            {l}
                                        </div>
                                        <div className="text-2xl font-display font-bold mt-2">
                                            {[12847, 342, 89, "18d"][i]}
                                        </div>
                                    </div>
                                ))}
                                <div className="col-span-2 rounded-md border border-border p-4">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                        Hiring funnel
                                    </div>
                                    <div className="flex gap-1.5 h-20 items-end">
                                        {[60, 80, 45, 92, 100, 78, 88, 70].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-primary/80 rounded-sm"
                                                style={{ height: `${h}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* LOGO STRIP */}
            <section className="border-y border-border bg-secondary/30">
                <div className="mx-auto max-w-7xl px-6 md:px-12 py-10">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-6">
                        Trusted by talent teams at
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70">
                        {LOGOS.map((l) => (
                            <span key={l} className="font-display font-bold text-xl tracking-tight">
                                {l}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="py-24 md:py-32">
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                    <div className="max-w-2xl">
                        <Badge variant="outline" className="font-mono text-xs mb-4">
                            FEATURES
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
                            Everything your team needs.
                            <br />
                            <span className="text-muted-foreground">Nothing it doesn't.</span>
                        </h2>
                    </div>

                    <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <Card className="p-6 h-full border border-border hover:border-primary/40 transition-colors">
                                    <div className="h-10 w-10 rounded-md bg-secondary grid place-items-center mb-4">
                                        <f.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section id="customers" className="py-24 md:py-32 border-t border-border bg-secondary/20">
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight max-w-xl">
                        Loved by recruiters at fast-growing companies.
                    </h2>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t) => (
                            <Card key={t.name} className="p-6 border border-border">
                                <p className="text-base leading-relaxed">"{t.quote}"</p>
                                <div className="mt-6 flex items-center gap-3">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-sm font-medium">{t.name}</div>
                                        <div className="text-xs text-muted-foreground">{t.title}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING TEASE */}
            <section className="py-24 md:py-32">
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                    <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
                        <div>
                            <Badge variant="outline" className="font-mono text-xs mb-4">
                                PRICING
                            </Badge>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
                                Simple, scalable pricing.
                            </h2>
                        </div>
                        <Link to="/pricing">
                            <Button variant="outline" data-testid="landing-see-all-plans">
                                See all plans <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {PRICING_PLANS.map((p) => (
                            <Card
                                key={p.name}
                                className={`p-8 border ${p.highlight ? "border-primary ring-1 ring-primary" : "border-border"}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold uppercase tracking-[0.2em]">{p.name}</span>
                                    {p.highlight && <Badge>Popular</Badge>}
                                </div>
                                <div className="flex items-baseline gap-1 mt-3">
                                    <span className="text-4xl font-display font-bold">{p.price}</span>
                                    <span className="text-muted-foreground text-sm">{p.period}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{p.tagline}</p>
                                <Link to="/signup" className="block mt-6">
                                    <Button
                                        className="w-full"
                                        variant={p.highlight ? "default" : "outline"}
                                    >
                                        {p.cta}
                                    </Button>
                                </Link>
                                <ul className="mt-6 space-y-3 text-sm">
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-success mt-0.5" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 border-t border-border">
                <div className="mx-auto max-w-3xl px-6 md:px-12">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-10">
                        Frequently asked.
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {FAQ.map((f, i) => (
                            <AccordionItem key={i} value={`item-${i}`}>
                                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* BIG CTA */}
            <section className="py-24 md:py-32 border-t border-border bg-background relative overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
                <div className="mx-auto max-w-5xl px-6 md:px-12 text-center relative">
                    <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tighter leading-[0.95]">
                        Start hiring
                        <br />
                        <span className="text-accent">smarter.</span>
                    </h2>
                    <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
                        Set up your first pipeline in under 4 minutes. No credit card required.
                    </p>
                    <Link to="/signup">
                        <Button size="lg" className="mt-8" data-testid="footer-cta-btn">
                            Get started free
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}