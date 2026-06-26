import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, X } from "lucide-react";
import { PRICING_PLANS, FAQ } from "@/data/dummy";

const compare = [
    { feature: "Active job postings", starter: "1", growth: "10", enterprise: "Unlimited" },
    { feature: "Candidates / month", starter: "50", growth: "Unlimited", enterprise: "Unlimited" },
    { feature: "AI screening", starter: "Basic", growth: "Advanced", enterprise: "Custom models" },
    { feature: "Calendar integrations", starter: false, growth: true, enterprise: true },
    { feature: "SSO / SAML", starter: false, growth: false, enterprise: true },
    { feature: "Audit logs", starter: false, growth: false, enterprise: true },
    { feature: "Dedicated CSM", starter: false, growth: false, enterprise: true },
    { feature: "SLA", starter: "Best effort", growth: "99.9%", enterprise: "99.99%" },
];

function Cell({ v }) {
    if (v === true) return <Check className="h-4 w-4 text-success" />;
    if (v === false) return <X className="h-4 w-4 text-muted-foreground" />;
    return <span className="text-sm">{v}</span>;
}

export default function Pricing() {
    return (
        <div data-testid="pricing-page">
            <section className="py-24 md:py-32">
                <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
                    <Badge variant="outline" className="font-mono text-xs mb-4">
                        PRICING
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tighter">
                        Pricing that scales with you.
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Start free, upgrade when you're ready. All plans include unlimited team seats.
                    </p>
                </div>

                <div className="mx-auto max-w-7xl px-6 md:px-12 mt-12 grid md:grid-cols-3 gap-6">
                    {PRICING_PLANS.map((p) => (
                        <Card
                            key={p.name}
                            className={`p-8 border ${
                                p.highlight ? "border-primary ring-1 ring-primary" : "border-border"
                            }`}
                            data-testid={`pricing-card-${p.name.toLowerCase()}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold uppercase tracking-[0.2em]">
                                    {p.name}
                                </span>
                                {p.highlight && <Badge>Popular</Badge>}
                            </div>
                            <div className="flex items-baseline gap-1 mt-3">
                                <span className="text-5xl font-display font-bold">{p.price}</span>
                                <span className="text-muted-foreground">{p.period}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{p.tagline}</p>
                            <Link to="/signup" className="block mt-6">
                                <Button
                                    className="w-full"
                                    variant={p.highlight ? "default" : "outline"}
                                    data-testid={`pricing-cta-${p.name.toLowerCase()}`}
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
            </section>

            <section className="py-12 border-t border-border">
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                    <h2 className="text-2xl font-display font-bold tracking-tight mb-8">
                        Compare plans
                    </h2>
                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-secondary/60">
                                <tr>
                                    <th className="text-left p-4 font-medium">Feature</th>
                                    <th className="text-left p-4 font-medium">Starter</th>
                                    <th className="text-left p-4 font-medium">Growth</th>
                                    <th className="text-left p-4 font-medium">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compare.map((row) => (
                                    <tr key={row.feature} className="border-t border-border">
                                        <td className="p-4 font-medium">{row.feature}</td>
                                        <td className="p-4"><Cell v={row.starter} /></td>
                                        <td className="p-4"><Cell v={row.growth} /></td>
                                        <td className="p-4"><Cell v={row.enterprise} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="mx-auto max-w-3xl px-6 md:px-12">
                    <h2 className="text-3xl font-display font-bold tracking-tight mb-10">
                        Pricing questions
                    </h2>
                    <Accordion type="single" collapsible>
                        {FAQ.map((f, i) => (
                            <AccordionItem key={i} value={`item-${i}`}>
                                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>
        </div>
    );
}