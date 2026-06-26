// src/pages/Jobs.jsx — API-connected version
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MapPin, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/api/jobs";

const STATUS_COLOR = {
    OPEN: "bg-success/15 text-success",
    PAUSED: "bg-warning/15 text-warning",
    CLOSED: "bg-muted text-muted-foreground",
    DRAFT: "bg-secondary text-foreground",
};

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [dept, setDept] = useState("all");
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newJob, setNewJob] = useState({
        title: "", department: "", location: "", type: "Full-time",
        salary: "", description: "", requirements: "",
    });

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await jobsApi.list({ search: query, status, department: dept });
            setJobs(data.jobs || []);
        } catch (err) {
            // Fallback to empty; toast shown below if needed
            toast.error("Could not load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, [query, status, dept]); // eslint-disable-line

    const departments = useMemo(() => Array.from(new Set(jobs.map((j) => j.department))), [jobs]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const job = await jobsApi.create({
                ...newJob,
                requirements: newJob.requirements.split("\n").filter(Boolean),
                status: "OPEN",
            });
            setJobs((prev) => [job, ...prev]);
            toast.success("Job created!");
            setOpen(false);
            setNewJob({ title: "", department: "", location: "", type: "Full-time", salary: "", description: "", requirements: "" });
        } catch (err) {
            toast.error(err.message || "Could not create job");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6" data-testid="jobs-page">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Recruitment</div>
                    <h1 className="text-3xl font-display font-bold tracking-tight mt-1">Jobs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {loading ? "Loading…" : `${jobs.length} job${jobs.length !== 1 ? "s" : ""}`}
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-1.5" />New job</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Post a new job</DialogTitle></DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label>Job title *</Label>
                                    <Input value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} placeholder="Senior Frontend Engineer" className="mt-1.5" required />
                                </div>
                                <div>
                                    <Label>Department *</Label>
                                    <Input value={newJob.department} onChange={(e) => setNewJob({ ...newJob, department: e.target.value })} placeholder="Engineering" className="mt-1.5" required />
                                </div>
                                <div>
                                    <Label>Location *</Label>
                                    <Input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} placeholder="Remote" className="mt-1.5" required />
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <Select value={newJob.type} onValueChange={(v) => setNewJob({ ...newJob, type: v })}>
                                        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Salary</Label>
                                    <Input value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })} placeholder="$100k – $140k" className="mt-1.5" />
                                </div>
                                <div className="col-span-2">
                                    <Label>Description *</Label>
                                    <Textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} placeholder="What's the role about…" rows={3} className="mt-1.5" required />
                                </div>
                                <div className="col-span-2">
                                    <Label>Requirements (one per line)</Label>
                                    <Textarea value={newJob.requirements} onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })} placeholder={"5+ years React experience\nStrong TypeScript"} rows={3} className="mt-1.5" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : "Create job"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search jobs…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
                </div>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {["OPEN", "PAUSED", "CLOSED", "DRAFT"].map((s) => (
                            <SelectItem key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Job cards */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">No jobs found.</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((j) => (
                        <Link key={j.id} to={`/app/jobs/${j.id}`}>
                            <Card className="border border-border p-5 hover:border-primary/40 transition-colors cursor-pointer h-full flex flex-col">
                                <div className="flex items-start justify-between gap-2">
                                    <h2 className="font-display font-semibold text-sm leading-snug">{j.title}</h2>
                                    <Badge className={`text-xs shrink-0 ${STATUS_COLOR[j.status] || ""}`}>
                                        {j.status[0] + j.status.slice(1).toLowerCase()}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{j.department}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{j.applicants} applicants</span>
                                </div>
                                {j.salary && <p className="text-xs font-medium mt-2">{j.salary}</p>}
                                <p className="text-xs text-muted-foreground mt-auto pt-3">
                                    {j.owner?.name || "—"} · {new Date(j.posted).toLocaleDateString()}
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
