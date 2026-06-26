// src/pages/Settings.jsx — API-connected
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User2, Users2, CreditCard, Plug, Bell, Loader2 } from "lucide-react";
import { INTEGRATIONS } from "@/data/dummy";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/auth";

const TABS = [
    { id: "profile", label: "Profile", icon: User2 },
    { id: "team", label: "Team", icon: Users2 },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Plug },
    { id: "notifications", label: "Notifications", icon: Bell },
];

export default function Settings() {
    const [tab, setTab] = useState("profile");

    return (
        <div className="space-y-6" data-testid="settings-page">
            <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
                <h1 className="text-3xl font-display font-bold tracking-tight mt-1">Settings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <nav className="lg:col-span-1 space-y-1">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            data-testid={`settings-tab-${t.id}`}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                                tab === t.id
                                    ? "bg-secondary text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            )}
                        >
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    ))}
                </nav>

                <div className="lg:col-span-3 space-y-6">
                    {tab === "profile" && <ProfileTab />}
                    {tab === "team" && <TeamTab />}
                    {tab === "billing" && <BillingTab />}
                    {tab === "integrations" && <IntegrationsTab />}
                    {tab === "notifications" && <NotificationsTab />}
                </div>
            </div>
        </div>
    );
}

function ProfileTab() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || "", company: user?.company || "" });
    const [saving, setSaving] = useState(false);
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [savingPw, setSavingPw] = useState(false);

    const saveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await authApi.updateProfile(form);
            setUser(updated);
            localStorage.setItem("hireos_user", JSON.stringify(updated));
            toast.success("Profile saved");
        } catch (err) {
            toast.error(err.message || "Could not save profile");
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) {
            toast.error("New passwords don't match");
            return;
        }
        setSavingPw(true);
        try {
            await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success("Password updated");
            setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (err) {
            toast.error(err.message || "Could not update password");
        } finally {
            setSavingPw(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border border-border p-6">
                <h2 className="font-display text-lg font-semibold">Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Update your personal information.</p>
                <Separator className="my-6" />
                <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback className="text-xl">{user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">Change avatar</Button>
                </div>
                <form onSubmit={saveProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Full name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input value={user?.email || ""} disabled className="mt-1.5 opacity-60" />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Input value={user?.role || ""} disabled className="mt-1.5 opacity-60 capitalize" />
                        </div>
                        <div>
                            <Label>Company</Label>
                            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1.5" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" type="button" onClick={() => setForm({ name: user?.name || "", company: user?.company || "" })}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save changes"}
                        </Button>
                    </div>
                </form>
            </Card>

            <Card className="border border-border p-6">
                <h2 className="font-display text-lg font-semibold">Change password</h2>
                <Separator className="my-6" />
                <form onSubmit={savePassword}>
                    <div className="space-y-4 max-w-sm">
                        <div>
                            <Label>Current password</Label>
                            <Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="mt-1.5" required />
                        </div>
                        <div>
                            <Label>New password</Label>
                            <Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} className="mt-1.5" required minLength={8} />
                        </div>
                        <div>
                            <Label>Confirm new password</Label>
                            <Input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className="mt-1.5" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="submit" disabled={savingPw}>
                            {savingPw ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating…</> : "Update password"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

function TeamTab() {
    return (
        <Card className="border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                    <h2 className="font-display text-lg font-semibold">Team members</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage who has access to your workspace.</p>
                </div>
                <Button onClick={() => toast.info("Invite coming soon")}>Invite member</Button>
            </div>
            <div className="p-6 text-sm text-muted-foreground">
                Team management via the API is coming soon. Use the Messages page to collaborate with existing team members.
            </div>
        </Card>
    );
}

function BillingTab() {
    return (
        <div className="space-y-6">
            <Card className="border border-border p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-lg font-semibold">Current plan</h2>
                        <p className="text-sm text-muted-foreground mt-1">You're on the Growth plan, billed monthly.</p>
                    </div>
                    <Badge>Growth</Badge>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { l: "Seats", v: "5 / Unlimited" },
                        { l: "Active jobs", v: "8 / 10" },
                        { l: "Candidates", v: "847" },
                        { l: "Next invoice", v: "Mar 1, 2027" },
                    ].map((s) => (
                        <div key={s.l}>
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{s.l}</div>
                            <div className="font-display font-semibold text-lg mt-1">{s.v}</div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-6">
                    <Button variant="outline">Change plan</Button>
                    <Button variant="ghost">Cancel subscription</Button>
                </div>
            </Card>
            <Card className="border border-border p-6">
                <h2 className="font-display text-lg font-semibold">Payment method</h2>
                <div className="mt-4 flex items-center justify-between p-4 border border-border rounded-md">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-12 rounded bg-foreground text-background grid place-items-center text-xs font-bold">VISA</div>
                        <div>
                            <div className="font-medium">•••• •••• •••• 4242</div>
                            <div className="text-xs text-muted-foreground">Expires 04 / 2028</div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                </div>
            </Card>
        </div>
    );
}

function IntegrationsTab() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRATIONS.map((i) => (
                <Card key={i.name} className="border border-border p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-display font-semibold">{i.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{i.desc}</p>
                        </div>
                        <Badge variant={i.connected ? "default" : "outline"}>
                            {i.connected ? "Connected" : "Disconnected"}
                        </Badge>
                    </div>
                    <Button variant={i.connected ? "outline" : "default"} size="sm" className="mt-4"
                        onClick={() => toast.info(`${i.connected ? "Managing" : "Connecting"} ${i.name}…`)}>
                        {i.connected ? "Manage" : "Connect"}
                    </Button>
                </Card>
            ))}
        </div>
    );
}

function NotificationsTab() {
    const prefs = [
        { id: "new-app", label: "New applications", desc: "When a candidate applies to one of your jobs", on: true },
        { id: "stage-change", label: "Stage changes", desc: "When teammates move a candidate", on: true },
        { id: "interview-reminders", label: "Interview reminders", desc: "30 minutes before scheduled interviews", on: true },
        { id: "weekly-digest", label: "Weekly digest", desc: "Mondays at 9am — hiring metrics summary", on: false },
    ];
    return (
        <Card className="border border-border p-6">
            <h2 className="font-display text-lg font-semibold">Email notifications</h2>
            <Separator className="my-6" />
            <div className="space-y-5">
                {prefs.map((p) => (
                    <div key={p.id} className="flex items-start justify-between gap-4">
                        <div>
                            <div className="font-medium">{p.label}</div>
                            <div className="text-sm text-muted-foreground">{p.desc}</div>
                        </div>
                        <Switch
                            defaultChecked={p.on}
                            onCheckedChange={() => toast.success("Preference saved")}
                            data-testid={`notif-${p.id}`}
                        />
                    </div>
                ))}
            </div>
        </Card>
    );
}
