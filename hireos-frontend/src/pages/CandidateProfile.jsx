// src/pages/CandidateProfile.jsx — API-connected
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Mail, Phone, MapPin, Download, MessageSquare, CalendarPlus, Loader2, Trash2, Sparkles } from "lucide-react";
import { candidatesApi } from "@/api/candidates";
import { screeningApi } from "@/api/screening";
import { toast } from "sonner";

const STAGES = ["New", "Screened", "Interview", "Offer", "Hired", "Rejected"];
const stageColor = {
    NEW: "bg-secondary text-foreground", SCREENED: "bg-primary/10 text-primary",
    INTERVIEW: "bg-warning/15 text-warning", OFFER: "bg-success/15 text-success",
    HIRED: "bg-success text-white", REJECTED: "bg-destructive/15 text-destructive",
};

export default function CandidateProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [screening, setScreening] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        Promise.all([
            candidatesApi.get(id),
            screeningApi.getScreeningsForCandidate(id).then((s) => s[0] || null),
            candidatesApi.getRecommendations(id).then((r) => r.recommendations || []).catch(() => []),
        ])
            .then(([c, s, recs]) => { setCandidate(c); setScreening(s); setRecommendations(recs); })
            .catch(() => toast.error("Could not load candidate"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleStageChange = async (stage) => {
        try {
            const updated = await candidatesApi.updateStage(id, stage);
            setCandidate((c) => ({ ...c, stage: updated.stage }));
            toast.success("Stage updated");
        } catch { toast.error("Could not update stage"); }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this candidate? This cannot be undone.")) return;
        try {
            await candidatesApi.delete(id);
            toast.success("Candidate deleted");
            navigate("/app/candidates");
        } catch { toast.error("Could not delete candidate"); }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );

    if (!candidate) return (
        <div className="text-center py-32 text-muted-foreground">Candidate not found.</div>
    );

    const c = candidate;
    const parsed = screening?.parsedData || {};
    const insights = screening?.insights || [];
    const interviewQs = screening?.interviewQs || [];

    return (
        <div className="space-y-6" data-testid="candidate-profile-page">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link to="/app/candidates" className="hover:text-foreground">Candidates</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{c.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left card */}
                <Card className="p-6 border border-border lg:col-span-1 h-fit space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={c.avatarUrl} />
                            <AvatarFallback className="text-xl">{c.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-display font-bold">{c.name}</h2>
                            <p className="text-sm text-muted-foreground">{c.appliedFor}</p>
                        </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                        {c.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{c.email}</div>}
                        {c.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{c.phone}</div>}
                        {c.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{c.location}</div>}
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-secondary/30">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">AI match score</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-display font-bold">{c.score}</span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all" style={{ width: `${c.score}%` }} />
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Stage</div>
                        <Select value={c.stage} onValueChange={handleStageChange}>
                            <SelectTrigger>
                                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md ${stageColor[c.stage] ?? ""}`}>
                                    {c.stage[0] + c.stage.slice(1).toLowerCase()}
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                {STAGES.map((s) => <SelectItem key={s} value={s.toUpperCase()}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {c.skills?.length > 0 && (
                        <div>
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Top skills</div>
                            <div className="flex flex-wrap gap-1.5">
                                {c.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                        <Link to="/app/screening">
                            <Button variant="outline" className="w-full" size="sm">
                                <Download className="h-4 w-4 mr-1.5" /> Screen resume
                            </Button>
                        </Link>
                        <Link to="/app/messages">
                            <Button variant="outline" className="w-full" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1.5" /> Message
                            </Button>
                        </Link>
                        <Link to="/app/scheduler">
                            <Button className="w-full" size="sm">
                                <CalendarPlus className="h-4 w-4 mr-1.5" /> Schedule interview
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Right detail */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="overview">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="screening">AI Screening</TabsTrigger>
                            <TabsTrigger value="interviews">Interviews</TabsTrigger>
                            <TabsTrigger value="recommendations">
                                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                Similar Candidates
                                {recommendations.length > 0 && (
                                    <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                                        {recommendations.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4 space-y-4">
                            {c.summary && (
                                <Card className="p-5 border border-border">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Summary</div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{c.summary}</p>
                                </Card>
                            )}
                            {parsed.experience?.length > 0 && (
                                <Card className="p-5 border border-border">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Experience</div>
                                    <div className="space-y-4">
                                        {parsed.experience.map((exp, i) => (
                                            <div key={i} className="border-l-2 border-border pl-4">
                                                <div className="font-medium">{exp.role}</div>
                                                <div className="text-sm text-muted-foreground">{exp.company} · {exp.period}</div>
                                                {exp.bullets?.length > 0 && (
                                                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                                                        {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                            {parsed.education?.length > 0 && (
                                <Card className="p-5 border border-border">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Education</div>
                                    <div className="space-y-2">
                                        {parsed.education.map((edu, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{edu.degree}</div>
                                                    <div className="text-sm text-muted-foreground">{edu.school}</div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                            {!c.summary && !parsed.experience && (
                                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                                    No resume data yet. Run AI screening to populate this tab.
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="screening" className="mt-4 space-y-4">
                            {!screening ? (
                                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                                    No screening run yet.{" "}
                                    <Link to="/app/screening" className="text-primary underline">Run one now</Link>
                                </div>
                            ) : (
                                <>
                                    {insights.length > 0 && (
                                        <Card className="p-5 border border-border">
                                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Insights</div>
                                            <div className="space-y-4">
                                                {insights.map((ins) => (
                                                    <div key={ins.label}>
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span>{ins.label}</span>
                                                            <span className="font-mono">{ins.score}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div className={`h-full ${ins.label === "Risk flags" ? "bg-destructive" : "bg-primary"}`}
                                                                style={{ width: `${ins.score}%` }} />
                                                        </div>
                                                        {ins.note && <p className="text-xs text-muted-foreground mt-1">{ins.note}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    )}
                                    {interviewQs.length > 0 && (
                                        <Card className="p-5 border border-border">
                                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Suggested interview questions</div>
                                            <ol className="space-y-2">
                                                {interviewQs.map((q, i) => (
                                                    <li key={i} className="flex gap-3 text-sm">
                                                        <span className="font-mono text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}.</span>
                                                        <span>{q}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </Card>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="interviews" className="mt-4">
                            {c.interviews?.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                                    No interviews scheduled yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(c.interviews || []).map((iv) => (
                                        <Card key={iv.id} className="p-4 border border-border">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{iv.title}</div>
                                                    <div className="text-sm text-muted-foreground">{new Date(iv.date).toLocaleString()}</div>
                                                    {iv.recruiter && <div className="text-xs text-muted-foreground mt-1">With {iv.recruiter.name}</div>}
                                                </div>
                                                <Badge variant="outline">{iv.type}</Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="recommendations" className="mt-4">
                            {recommendations.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                                    <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No similar candidates found</p>
                                    <p className="text-sm mt-1">Add more candidates with similar roles or skills to see recommendations.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Candidates with similar role or overlapping skills — sorted by match quality.
                                    </p>
                                    {recommendations.map((rec) => (
                                        <Link key={rec.id} to={`/app/candidates/${rec.id}`}>
                                            <Card className="p-4 border border-border hover:border-primary/40 hover:bg-secondary/20 transition-colors cursor-pointer">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Avatar className="h-9 w-9 shrink-0">
                                                            <AvatarImage src={rec.avatarUrl} />
                                                            <AvatarFallback>{rec.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{rec.name}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{rec.appliedFor}</div>
                                                            {rec.commonSkills?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                                    {rec.commonSkills.slice(0, 4).map((s) => (
                                                                        <Badge key={s} variant="secondary" className="text-xs py-0 px-1.5">{s}</Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 space-y-1">
                                                        <div className="text-xs text-muted-foreground">AI Score</div>
                                                        <div className="font-mono font-bold text-lg">{rec.score}</div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {rec.similarity}% match
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
