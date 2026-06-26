// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, loading } = useAuth();
    const [email, setEmail] = useState("maya@hireos.io");
    const [pw, setPw] = useState("demo1234");

    const from = location.state?.from?.pathname || "/app/dashboard";

    const submit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, pw);
            toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.message || "Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2" data-testid="login-page">
            <div className="hidden lg:block relative bg-secondary/40 border-r border-border overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-40" />
                <div className="relative h-full p-12 flex flex-col justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-display font-bold text-lg">HireOS.</span>
                    </Link>
                    <div>
                        <p className="text-2xl md:text-3xl font-display font-bold tracking-tight leading-tight max-w-md">
                            "HireOS replaced four tools in our stack and made our team 2× faster."
                        </p>
                        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center font-display font-bold">P</div>
                            <div>
                                <div className="text-foreground font-medium">Priya Singh</div>
                                <div>Head of Talent · Linear-ish</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <div className="flex items-center justify-between p-6">
                    <Link to="/" className="lg:hidden flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="font-display font-bold">HireOS.</span>
                    </Link>
                    <div className="ml-auto"><ThemeToggle /></div>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                    <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
                        <h1 className="text-3xl font-display font-bold tracking-tight">Welcome back</h1>
                        <p className="text-sm text-muted-foreground mt-2">Sign in to your HireOS workspace.</p>
                        <div className="space-y-4 mt-8">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" data-testid="login-email-input" required />
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pw">Password</Label>
                                    <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</a>
                                </div>
                                <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5" data-testid="login-password-input" required />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-btn">
                                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</> : <>Sign in <ArrowRight className="h-4 w-4 ml-1" /></>}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-6">
                            Don't have an account?{" "}<Link to="/signup" className="text-foreground underline">Create one</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
