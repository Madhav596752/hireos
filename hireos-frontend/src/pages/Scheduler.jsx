// src/pages/Scheduler.jsx  (REPLACE EXISTING FILE)
//
// CHANGE: Uses interviewsApi (/api/interviews) instead of dashboardApi.createInterview.
//         This ensures:
//           1. Email is sent to the candidate on scheduling.
//           2. Data isolation is enforced (can't schedule for other-company candidates).
//           3. Reschedule also triggers a re-invite email automatically.
//
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Video, Clock, Loader2, Mail, Pencil, Trash2 } from "lucide-react";
import { interviewsApi } from "@/api/interviews";
import { candidatesApi } from "@/api/candidates";
import { toast } from "sonner";

const typeColor = {
    "Video Call":    "bg-primary/10 text-primary",
    "Onsite":        "bg-warning/15 text-warning",
    "Phone Screen":  "bg-success/15 text-success",
    "Technical":     "bg-accent/15 text-accent",
    "Final Round":   "bg-success text-white",
};

const statusColor = {
    scheduled:  "bg-primary/10 text-primary",
    completed:  "bg-success/15 text-success",
    cancelled:  "bg-destructive/15 text-destructive",
};

const EMPTY_FORM = {
    candidateId: "", title: "", date: "", time: "10:00",
    duration: "60", type: "Video Call", meetingUrl: "", notes: "",
};

export default function Scheduler() {
    const [date, setDate]           = useState(new Date());
    const [interviews, setInterviews] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [open, setOpen]           = useState(false);
    const [creating, setCreating]   = useState(false);

    // Edit mode
    const [editTarget, setEditTarget] = useState(null); // interview object
    const [editForm, setEditForm]     = useState({});
    const [editOpen, setEditOpen]     = useState(false);
    const [saving, setSaving]         = useState(false);

    useEffect(() => {
        Promise.all([
            interviewsApi.list(),
            candidatesApi.list({ limit: 200 }),
        ])
            .then(([ivs, cands]) => {
                setInterviews(Array.isArray(ivs) ? ivs : []);
                setCandidates(cands.candidates || []);
            })
            .catch(() => toast.error("Could not load schedule"))
            .finally(() => setLoading(false));
    }, []);

    const [form, setForm] = useState(EMPTY_FORM);

    // ── Interviews for selected calendar date ──────────────────────────
    const dayInterviews = interviews.filter((iv) => {
        const d = new Date(iv.date);
        return date &&
            d.getFullYear() === date.getFullYear() &&
            d.getMonth()    === date.getMonth()    &&
            d.getDate()     === date.getDate();
    });

    const upcoming = [...interviews]
        .filter((iv) => new Date(iv.date) >= new Date() && iv.status !== "cancelled")
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    // ── Create ─────────────────────────────────────────────────────────
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.candidateId || !form.date || !form.title) {
            toast.error("Candidate, title and date are required");
            return;
        }
        setCreating(true);
        try {
            const dateTime = new Date(`${form.date}T${form.time}`);
            const iv = await interviewsApi.schedule({
                candidateId: form.candidateId,
                title:       form.title,
                date:        dateTime.toISOString(),
                duration:    parseInt(form.duration),
                type:        form.type,
                meetingUrl:  form.meetingUrl || null,
                notes:       form.notes      || null,
            });
            setInterviews((prev) => [...prev, iv]);
            toast.success("Interview scheduled! 📧 Invite sent to candidate.");
            setOpen(false);
            setForm(EMPTY_FORM);
        } catch (err) {
            toast.error(err.message || "Could not schedule interview");
        } finally {
            setCreating(false);
        }
    };

    // ── Edit / Reschedule ──────────────────────────────────────────────
    const openEdit = (iv) => {
        const d = new Date(iv.date);
        setEditTarget(iv);
        setEditForm({
            title:      iv.title,
            date:       d.toISOString().split("T")[0],
            time:       d.toTimeString().slice(0, 5),
            duration:   String(iv.duration),
            type:       iv.type,
            meetingUrl: iv.meetingUrl || "",
            notes:      iv.notes     || "",
            status:     iv.status,
        });
        setEditOpen(true);
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const dateTime = new Date(`${editForm.date}T${editForm.time}`);
            const updated = await interviewsApi.update(editTarget.id, {
                title:      editForm.title,
                date:       dateTime.toISOString(),
                duration:   parseInt(editForm.duration),
                type:       editForm.type,
                meetingUrl: editForm.meetingUrl || null,
                notes:      editForm.notes      || null,
                status:     editForm.status,
            });
            setInterviews((prev) => prev.map((iv) => iv.id === updated.id ? updated : iv));
            toast.success(
                updated.date !== editTarget.date
                    ? "Interview rescheduled! 📧 New invite sent to candidate."
                    : "Interview updated."
            );
            setEditOpen(false);
        } catch (err) {
            toast.error(err.message || "Could not update interview");
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm("Delete this interview?")) return;
        try {
            await interviewsApi.delete(id);
            setInterviews((prev) => prev.filter((iv) => iv.id !== id));
            toast.success("Interview deleted.");
        } catch (err) {
            toast.error(err.message || "Could not delete interview");
        }
    };

    const set  = (k) => (v) => setForm((f)     => ({ ...f, [k]: v }));
    const setE = (k) => (e) => setForm((f)     => ({ ...f, [k]: e.target.value }));
    const setEF = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));
    const setSF  = (k) => (v) => setEditForm((f) => ({ ...f, [k]: v }));

    return (
        <div className="space-y-6" data-testid="scheduler-page">
            {/* ── Header ── */}
            <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Interviews</div>
                    <h1 className="text-3xl font-display font-bold tracking-tight mt-1">Scheduler</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {loading ? "Loading…" : `${interviews.length} interview${interviews.length !== 1 ? "s" : ""} scheduled`}
                    </p>
                </div>

                {/* ── New Interview Dialog ── */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="scheduler-new-btn"><Plus className="h-4 w-4 mr-1.5" /> New interview</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Schedule an interview</DialogTitle></DialogHeader>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Mail className="h-4 w-4" /> An invite will be emailed to the candidate automatically.
                        </p>
                        <form onSubmit={handleCreate} className="space-y-4 mt-2">
                            <div>
                                <Label>Candidate *</Label>
                                <Select value={form.candidateId} onValueChange={set("candidateId")}>
                                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select candidate…" /></SelectTrigger>
                                    <SelectContent>
                                        {candidates.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} — {c.appliedFor}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Title *</Label>
                                <Input value={form.title} onChange={setE("title")} placeholder="Technical interview" className="mt-1.5" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Date *</Label>
                                    <Input type="date" value={form.date} onChange={setE("date")} className="mt-1.5" required />
                                </div>
                                <div>
                                    <Label>Time</Label>
                                    <Input type="time" value={form.time} onChange={setE("time")} className="mt-1.5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Duration (min)</Label>
                                    <Select value={form.duration} onValueChange={set("duration")}>
                                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["30", "45", "60", "90", "120"].map((d) => (
                                                <SelectItem key={d} value={d}>{d} min</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <Select value={form.type} onValueChange={set("type")}>
                                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["Video Call", "Phone Screen", "Onsite", "Technical", "Final Round"].map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>Meeting URL</Label>
                                <Input value={form.meetingUrl} onChange={setE("meetingUrl")} placeholder="https://meet.google.com/…" className="mt-1.5" />
                            </div>
                            <div>
                                <Label>Notes</Label>
                                <Input value={form.notes} onChange={setE("notes")} placeholder="Any prep notes for the candidate…" className="mt-1.5" />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scheduling…</> : "Schedule & send invite"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* ── Edit Dialog ── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit interview</DialogTitle></DialogHeader>
                    {editTarget && (
                        <p className="text-sm text-muted-foreground">
                            Candidate: <strong>{editTarget.candidate?.name}</strong>
                        </p>
                    )}
                    <form onSubmit={handleEdit} className="space-y-4 mt-2">
                        <div>
                            <Label>Title</Label>
                            <Input value={editForm.title || ""} onChange={setEF("title")} className="mt-1.5" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Date</Label>
                                <Input type="date" value={editForm.date || ""} onChange={setEF("date")} className="mt-1.5" required />
                            </div>
                            <div>
                                <Label>Time</Label>
                                <Input type="time" value={editForm.time || ""} onChange={setEF("time")} className="mt-1.5" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Duration (min)</Label>
                                <Select value={editForm.duration || "60"} onValueChange={setSF("duration")}>
                                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["30", "45", "60", "90", "120"].map((d) => (
                                            <SelectItem key={d} value={d}>{d} min</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={editForm.status || "scheduled"} onValueChange={setSF("status")}>
                                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>Meeting URL</Label>
                            <Input value={editForm.meetingUrl || ""} onChange={setEF("meetingUrl")} placeholder="https://meet.google.com/…" className="mt-1.5" />
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Input value={editForm.notes || ""} onChange={setEF("notes")} className="mt-1.5" />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Calendar + Upcoming ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border border-border p-4 lg:col-span-2 h-fit">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                        data-testid="scheduler-calendar"
                    />
                </Card>

                <Card className="border border-border p-6">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Upcoming</div>
                    <h3 className="font-display text-lg font-semibold mb-4">Next interviews</h3>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : upcoming.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">No upcoming interviews.</div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((iv) => (
                                <div
                                    key={iv.id}
                                    className="p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
                                    data-testid={`interview-card-${iv.id}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={iv.candidate?.avatarUrl} />
                                            <AvatarFallback>{iv.candidate?.name?.[0] ?? "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium truncate">{iv.candidate?.name}</div>
                                            <div className="text-xs text-muted-foreground truncate">{iv.candidate?.appliedFor}</div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => openEdit(iv)}
                                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(iv.id)}
                                                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(iv.date).toLocaleDateString()} · {new Date(iv.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md ${typeColor[iv.type] || "bg-secondary"}`}>
                                            {iv.type}
                                        </span>
                                    </div>
                                    {iv.meetingUrl && (
                                        <a href={iv.meetingUrl} target="_blank" rel="noreferrer"
                                            className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
                                            <Video className="h-3 w-3" /> Join meeting
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Day view ── */}
            <Card className="border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Schedule</div>
                        <h3 className="font-display text-lg font-semibold mt-1">{date?.toDateString()}</h3>
                    </div>
                    <Badge variant="outline">{dayInterviews.length} event{dayInterviews.length !== 1 ? "s" : ""}</Badge>
                </div>
                {dayInterviews.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                        No interviews on this day.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {dayInterviews.map((iv) => (
                            <div key={iv.id} className="flex items-center gap-4 p-3 rounded-md border border-border hover:bg-secondary/30 group">
                                <div className="font-mono text-sm text-muted-foreground w-24 shrink-0">
                                    {new Date(iv.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                                <div className={`h-8 w-1 rounded-full shrink-0 ${iv.status === "cancelled" ? "bg-destructive/50" : "bg-primary"}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{iv.title}</div>
                                    <div className="text-xs text-muted-foreground">{iv.candidate?.name} · {iv.duration} min</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-md ${statusColor[iv.status] || "bg-secondary"}`}>
                                        {iv.status}
                                    </span>
                                    <Badge variant="outline">{iv.type}</Badge>
                                    <button
                                        onClick={() => openEdit(iv)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary text-muted-foreground transition-all"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(iv.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
