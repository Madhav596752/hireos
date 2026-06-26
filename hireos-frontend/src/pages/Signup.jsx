// src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const benefits = ["14-day free trial", "No credit card required", "Unlimited team seats", "Cancel anytime"];

export default function Signup() {
    const navigate = useNavigate();
    const { register, loading } = useAuth();
    const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        try {
            await register(form);
            toast.success("Workspace created — welcome to HireOS!");
            navigate("/app/dashboard");
        } catch (err) {
            toast.error(err.message || "Could not create account");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2" data-testid="signup-page">
            <div className="flex flex-col">
                <div className="flex items-center justify-between p-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-display font-bold">HireOS.</span>
                    </Link>
                    <ThemeToggle />
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                    <form onSubmit={submit} className="w-full max-w-sm" data-testid="signup-form">
                        <h1 className="text-3xl font-display font-bold tracking-tight">Create your workspace</h1>
                        <p className="text-sm text-muted-foreground mt-2">Start hiring with HireOS in less than 2 minutes.</p>
                        <div className="mt-8 space-y-4">
                            <div>
                                <Label htmlFor="name">Full name</Label>
                                <Input id="name" value={form.name} onChange={set("name")} placeholder="Maya Chen" className="mt-1.5" data-testid="signup-name-input" required />
                            </div>
                            <div>
                                <Label htmlFor="company">Company</Label>
                                <Input id="company" value={form.company} onChange={set("company")} placeholder="Acme Inc." className="mt-1.5" data-testid="signup-company-input" />
                            </div>
                            <div>
                                <Label htmlFor="email">Work email</Label>
                                <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" className="mt-1.5" data-testid="signup-email-input" required />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="At least 8 characters" className="mt-1.5" data-testid="signup-password-input" required minLength={8} />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading} data-testid="signup-submit-btn">
                                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : <>Create workspace <ArrowRight className="h-4 w-4 ml-1" /></>}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-6">
                            Already have an account?{" "}<Link to="/login" className="text-foreground underline">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex relative bg-secondary/40 border-l border-border p-12 flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-50" />
                <div className="relative">
                    <h2 className="text-4xl font-display font-bold tracking-tight max-w-md leading-tight">
                        Hire your next 10 people without losing your weekends.
                    </h2>
                    <ul className="mt-8 space-y-3">
                        {benefits.map((b) => (
                            <li key={b} className="flex items-center gap-3 text-sm">
                                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary grid place-items-center">
                                    <Check className="h-3 w-3" />
                                </span>
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
