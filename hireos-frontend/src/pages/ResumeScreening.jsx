// src/pages/ResumeScreening.jsx — API-connected
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Sparkles, RefreshCw, CheckCircle2, Loader2, User } from "lucide-react";
import { screeningApi } from "@/api/screening";
import { candidatesApi } from "@/api/candidates";
import { toast } from "sonner";

export default function ResumeScreening() {
    const [phase, setPhase] = useState("idle"); // idle | parsing | done | error
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [file, setFile] = useState(null);
    const [resumeText, setResumeText] = useState("");
    const [jobDescription, setJobDescription] = useState(
        "Senior Frontend Engineer (Remote · EU)\n· 5+ years React/TypeScript\n· Design system experience\n· Owned high-perf product surfaces"
    );
    const [candidateId, setCandidateId] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const fileRef = useRef();

    const loadCandidates = async () => {
        if (candidates.length > 0) return;
        setLoadingCandidates(true);
        try {
            const data = await candidatesApi.list({ limit: 50 });
            setCandidates(data.candidates || []);
        } catch { /* silent */ }
        finally { setLoadingCandidates(false); }
    };

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f?.type === "application/pdf") setFile(f);
    };

    const runScreening = async () => {
        if (!candidateId) { toast.error("Select a candidate first"); return; }
        if (!file && !resumeText.trim()) { toast.error("Upload a PDF or paste resume text"); return; }

        setPhase("parsing");
        setProgress(0);

        // Animate progress
        const timer = setInterval(() => setProgress((p) => Math.min(p + 8, 88)), 300);

        try {
            const data = await screeningApi.screenResume({
                resumeFile: file || null,
                resumeText: file ? "" : resumeText,
                candidateId,
                jobDescription,
            });
            clearInterval(timer);
            setProgress(100);
            setResult(data);
            setPhase("done");
            toast.success(`Screening complete · ${data.matchScore}% match`);
        } catch (err) {
            clearInterval(timer);
            setPhase("error");
            toast.error(err.message || "Screening failed");
        }
    };

    const reset = () => { setPhase("idle"); setProgress(0); setResult(null); setFile(null); };

    return (
        <div className="space-y-6" data-testid="screening-page">
            <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">AI Tools</div>
                <h1 className="text-3xl font-display font-bold tracking-tight mt-1">Resume Screening</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload a resume to extract structured data and run AI matching against your JD.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload panel */}
                <Card className="border border-border p-6 flex flex-col gap-5">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Step 1 — Upload</div>

                    {/* Candidate picker */}
                    <div>
                        <Label className="mb-1.5 block">Candidate *</Label>
                        <Select value={candidateId} onValueChange={setCandidateId} onOpenChange={loadCandidates}>
                            <SelectTrigger data-testid="screening-candidate-select">
                                <SelectValue placeholder="Select a candidate…" />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingCandidates ? (
                                    <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin" /></div>
                                ) : candidates.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">No candidates found</div>
                                ) : candidates.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        <span className="flex items-center gap-2">
                                            <User className="h-3 w-3" />{c.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {phase === "idle" && (
                        <>
                            <div
                                className="border-2 border-dashed border-border rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
                                data-testid="upload-zone"
                                onClick={() => fileRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
                                {file ? (
                                    <>
                                        <FileText className="h-10 w-10 text-primary mb-3" />
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                                        <p className="font-medium">Drop a PDF here or click to browse</p>
                                        <p className="text-xs text-muted-foreground mt-1">Up to 10 MB</p>
                                    </>
                                )}
                            </div>

                            <div className="text-center text-xs text-muted-foreground">— or paste text —</div>

                            <Textarea
                                rows={5}
                                className="font-mono text-xs"
                                placeholder="Paste resume text here…"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                data-testid="screening-text-input"
                            />

                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                                    Job description to match against
                                </div>
                                <Textarea
                                    rows={5}
                                    className="font-mono text-xs"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            <Button onClick={runScreening} data-testid="run-screening-btn" className="w-full">
                                <Sparkles className="h-4 w-4 mr-1.5" /> Run AI screening
                            </Button>
                        </>
                    )}

                    {phase === "parsing" && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
                            <div className="h-14 w-14 rounded-full bg-primary/10 grid place-items-center">
                                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                            <div>
                                <div className="font-display font-semibold">Analysing with Gemini AI…</div>
                                <div className="text-sm text-muted-foreground mt-1">Parsing resume · matching skills · generating questions</div>
                            </div>
                            <Progress value={progress} className="w-full max-w-xs" />
                            <div className="font-mono text-xs text-muted-foreground">{progress}%</div>
                        </div>
                    )}

                    {phase === "done" && (
                        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
                            <CheckCircle2 className="h-12 w-12 text-success" />
                            <div>
                                <div className="font-display font-semibold text-lg">Screening complete!</div>
                                <div className="text-sm text-muted-foreground">Results are shown on the right →</div>
                            </div>
                            <Button variant="outline" onClick={reset}>
                                <RefreshCw className="h-4 w-4 mr-1.5" /> Screen another
                            </Button>
                        </div>
                    )}

                    {phase === "error" && (
                        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
                            <div className="text-destructive font-medium">Screening failed. Check your API key and try again.</div>
                            <Button variant="outline" onClick={reset}><RefreshCw className="h-4 w-4 mr-1.5" /> Retry</Button>
                        </div>
                    )}
                </Card>

                {/* Results panel */}
                <Card className="border border-border p-6">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Step 2 — AI Results</div>

                    {!result ? (
                        <div className="border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-3" />
                            Run a screening to see results here.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-display text-xl font-bold">{result.parsedData?.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {result.parsedData?.title}{result.parsedData?.location ? ` · ${result.parsedData.location}` : ""}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className={`text-4xl font-display font-bold ${result.matchScore >= 80 ? "text-success" : result.matchScore >= 60 ? "text-warning" : "text-destructive"}`}>
                                        {result.matchScore}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Match score</div>
                                </div>
                            </div>

                            {result.parsedData?.summary && (
                                <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">{result.parsedData.summary}</p>
                            )}

                            {result.parsedData?.skills?.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Skills extracted</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.parsedData.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                                    </div>
                                </div>
                            )}

                            {result.insights?.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Insights</div>
                                    <div className="space-y-3">
                                        {result.insights.map((ins) => (
                                            <div key={ins.label}>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>{ins.label}</span>
                                                    <span className="font-mono">{ins.score}</span>
                                                </div>
                                                <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                    <div className={`h-full ${ins.label === "Risk flags" ? "bg-destructive" : "bg-primary"}`}
                                                        style={{ width: `${ins.score}%` }} />
                                                </div>
                                                {ins.note && <p className="text-xs text-muted-foreground mt-1">{ins.note}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.interviewQs?.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Interview questions</div>
                                    <ol className="space-y-1.5">
                                        {result.interviewQs.map((q, i) => (
                                            <li key={i} className="flex gap-2 text-sm">
                                                <span className="font-mono text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}.</span>
                                                <span>{q}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
