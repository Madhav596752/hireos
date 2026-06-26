// src/pages/JobDetail.jsx — API-connected
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight, MapPin, Users, Calendar, Edit3, Share2, DollarSign, Loader2, Trash2 } from "lucide-react";
import { jobsApi } from "@/api/jobs";
import { candidatesApi } from "@/api/candidates";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const STATUS_COLOR = {
    OPEN: "bg-success/15 text-success",
    PAUSED: "bg-warning/15 text-warning",
    CLOSED: "bg-muted text-muted-foreground",
    DRAFT: "bg-secondary text-foreground",
};
const PIPELINE_STAGES = ["NEW", "SCREENED", "INTERVIEW", "OFFER", "HIRED"];

export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        Promise.all([
            jobsApi.get(id),
            candidatesApi.list({ jobId: id, limit: 100 }),
        ])
            .then(([j, cands]) => {
                setJob(j);
                setEditForm({
                    title: j.title, department: j.department, location: j.location,
                    type: j.type, salary: j.salary || "", description: j.description,
                    requirements: (j.requirements || []).join("\n"), status: j.status,
                });
                setCandidates(cands.candidates || []);
            })
            .catch(() => toast.error("Could not load job"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await jobsApi.update(id, {
                ...editForm,
                requirements: editForm.requirements.split("\n").filter(Boolean),
            });
            setJob(updated);
            setEditing(false);
            toast.success("Job updated");
        } catch (err) {
            toast.error(err.message || "Could not update job");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this job? This cannot be undone.")) return;
        try {
            await jobsApi.delete(id);
            toast.success("Job deleted");
            navigate("/app/jobs");
        } catch (err) {
            toast.error(err.message || "Could not delete job");
        }
    };

    const pipeline = PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage] = candidates.filter((c) => c.stage === stage);
        return acc;
    }, {});

    const canEdit = user?.role === "ADMIN" || user?.role === "HR" || job?.ownerId === user?.id;

    if (loading) return (
        <div className="flex justify-center items-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );

    if (!job) return (
        <div className="text-center py-32 text-muted-foreground">Job not found.</div>
    );

    const setE = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));
    const setV = (k) => (v) => setEditForm((f) => ({ ...f, [k]: v }));

    return (
        <div className="space-y-6" data-testid="job-detail-page">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link to="/app/jobs" className="hover:text-foreground">Jobs</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{job.title}</span>
                </div>
                {canEdit && (
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                    </Button>
                )}
            </div>

            {/* Header card */}
            <Card className="p-6 border border-border">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md ${STATUS_COLOR[job.status]}`}>
                                {job.status[0] + job.status.slice(1).toLowerCase()}
                            </span>
                            <Badge variant="outline">{job.department}</Badge>
                            <Badge variant="outline">{job.type}</Badge>
                        </div>
                        <h1 className="text-3xl font-display font-bold tracking-tight">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{job.applicants} applicants</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Posted {new Date(job.posted).toLocaleDateString()}</span>
                            {job.salary && <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />{job.salary}</span>}
                        </div>
                        {job.owner && (
                            <div className="flex items-center gap-2 mt-3">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={job.owner.avatarUrl} />
                                    <AvatarFallback>{job.owner.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">Owned by {job.owner.name}</span>
                            </div>
                        )}
                    </div>
                    {canEdit && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success("Link copied"))} data-testid="job-share-btn">
                                <Share2 className="h-4 w-4 mr-1.5" /> Share
                            </Button>
                            <Button size="sm" onClick={() => setEditing(true)} data-testid="job-edit-btn">
                                <Edit3 className="h-4 w-4 mr-1.5" /> Edit
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Edit dialog */}
            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit job</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Title</Label>
                                <Input value={editForm.title} onChange={setE("title")} className="mt-1.5" required />
                            </div>
                            <div>
                                <Label>Department</Label>
                                <Input value={editForm.department} onChange={setE("department")} className="mt-1.5" />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input value={editForm.location} onChange={setE("location")} className="mt-1.5" />
                            </div>
                            <div>
                                <Label>Salary</Label>
                                <Input value={editForm.salary} onChange={setE("salary")} className="mt-1.5" />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={editForm.status} onValueChange={setV("status")}>
                                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["OPEN", "PAUSED", "CLOSED", "DRAFT"].map((s) => (
                                            <SelectItem key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Textarea value={editForm.description} onChange={setE("description")} rows={4} className="mt-1.5" />
                            </div>
                            <div className="col-span-2">
                                <Label>Requirements (one per line)</Label>
                                <Textarea value={editForm.requirements} onChange={setE("requirements")} rows={4} className="mt-1.5" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setEditing(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Tabs defaultValue="pipeline">
                <TabsList>
                    <TabsTrigger value="pipeline" data-testid="job-tab-pipeline">Pipeline</TabsTrigger>
                    <TabsTrigger value="description" data-testid="job-tab-description">Description</TabsTrigger>
                    <TabsTrigger value="candidates" data-testid="job-tab-candidates">
                        Candidates ({candidates.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pipeline" className="mt-6">
                    <div className="overflow-x-auto -mx-2 px-2">
                        <div className="flex gap-4 min-w-[900px]">
                            {PIPELINE_STAGES.map((stage) => (
                                <div key={stage} className="flex-1 min-w-[180px]">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-[0.2em]">
                                            {stage[0] + stage.slice(1).toLowerCase()}
                                        </span>
                                        <Badge variant="outline" className="font-mono">{pipeline[stage].length}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {pipeline[stage].length === 0 && (
                                            <div className="border-2 border-dashed border-border rounded-lg h-16 flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground">Empty</span>
                                            </div>
                                        )}
                                        {pipeline[stage].map((c) => (
                                            <Link key={c.id} to={`/app/candidates/${c.id}`} className="block">
                                                <Card className="p-3 border border-border hover:border-primary/50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-7 w-7">
                                                            <AvatarImage src={c.avatarUrl} />
                                                            <AvatarFallback>{c.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-medium truncate">{c.name}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{c.location}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-1.5">
                                                        <div className="h-1 flex-1 bg-secondary rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${c.score}%` }} />
                                                        </div>
                                                        <span className="text-xs font-mono">{c.score}</span>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="description" className="mt-6">
                    <Card className="p-8 border border-border max-w-3xl">
                        <h2 className="text-xl font-display font-semibold mb-3">About the role</h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
                        {job.requirements?.length > 0 && (
                            <>
                                <h2 className="text-xl font-display font-semibold mt-8 mb-3">What we're looking for</h2>
                                <ul className="space-y-2 text-sm">
                                    {job.requirements.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="candidates" className="mt-6">
                    <Card className="border border-border overflow-hidden">
                        {candidates.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground text-sm">
                                No candidates linked to this job yet.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-secondary/40 text-left">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Candidate</th>
                                        <th className="px-6 py-3 font-medium">Location</th>
                                        <th className="px-6 py-3 font-medium">Stage</th>
                                        <th className="px-6 py-3 font-medium">AI score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((c) => (
                                        <tr key={c.id} className="border-t border-border hover:bg-secondary/30">
                                            <td className="px-6 py-3">
                                                <Link to={`/app/candidates/${c.id}`} className="flex items-center gap-3 hover:underline">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={c.avatarUrl} />
                                                        <AvatarFallback>{c.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{c.name}</span>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3 text-muted-foreground">{c.location}</td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs capitalize">{c.stage[0] + c.stage.slice(1).toLowerCase()}</span>
                                            </td>
                                            <td className="px-6 py-3 font-mono">{c.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
