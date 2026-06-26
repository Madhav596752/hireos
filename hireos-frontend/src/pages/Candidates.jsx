// src/pages/Candidates.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download, Loader2, UserPlus, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { candidatesApi } from "@/api/candidates";
import { jobsApi } from "@/api/jobs";
import { toast } from "sonner";

const STAGES = ["New", "Screened", "Interview", "Offer", "Hired", "Rejected"];

const stageColor = {
  NEW:       "bg-secondary text-foreground",
  SCREENED:  "bg-primary/10 text-primary",
  INTERVIEW: "bg-warning/15 text-warning",
  OFFER:     "bg-success/15 text-success",
  HIRED:     "bg-success text-white",
  REJECTED:  "bg-destructive/15 text-destructive",
};

const emptyForm = {
  name: "", email: "", phone: "", location: "",
  appliedFor: "", jobId: "", stage: "NEW",
};

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState("");
  const [minScore, setMinScore]     = useState([0]);
  const [stage, setStage]           = useState("all");
  const [selected, setSelected]     = useState({});

  // Add candidate dialog
  const [open, setOpen]         = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [jobs, setJobs]         = useState([]);

  // Bulk import dialog
  const [bulkOpen, setBulkOpen]           = useState(false);
  const [bulkPreview, setBulkPreview]     = useState([]);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult]       = useState(null);

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await candidatesApi.list({
        search:   query,
        stage:    stage === "all" ? "" : stage,
        minScore: minScore[0],
      });
      setCandidates(data.candidates || []);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [query, stage, minScore]);

  useEffect(() => {
    const t = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(t);
  }, [fetchCandidates]);

  const loadJobs = async () => {
    if (jobs.length > 0) return;
    try {
      const data = await jobsApi.list({ status: "OPEN", limit: 50 });
      setJobs(data.jobs || []);
    } catch { /* silent */ }
  };

  const setF = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.appliedFor) {
      toast.error("Name, email and applied-for role are required");
      return;
    }
    setCreating(true);
    try {
      const candidate = await candidatesApi.create({
        name:       form.name,
        email:      form.email,
        phone:      form.phone    || null,
        location:   form.location || null,
        appliedFor: form.appliedFor,
        jobId:      form.jobId    || null,
        stage:      "NEW",
        score:      0,
        skills:     [],
      });
      setCandidates((prev) => [candidate, ...prev]);
      toast.success(`${candidate.name} added successfully!`);
      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.message || "Could not add candidate");
    } finally {
      setCreating(false);
    }
  };

  const handleStageChange = async (id, newStage) => {
    try {
      await candidatesApi.updateStage(id, newStage);
      setCandidates((prev) =>
        prev.map((c) => c.id === id ? { ...c, stage: newStage.toUpperCase() } : c)
      );
      toast.success("Stage updated successfully");
    } catch {
      toast.error("Could not update stage");
    }
  };

  const allChecked    = candidates.length > 0 && candidates.every((c) => selected[c.id]);
  const toggleAll     = (val) => {
    const next = {};
    candidates.forEach((c) => (next[c.id] = val));
    setSelected(next);
  };
  const selectedCount = Object.values(selected).filter(Boolean).length;

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const toExport = selectedCount > 0
      ? candidates.filter((c) => selected[c.id])
      : candidates;

    if (toExport.length === 0) { toast.error("No candidates to export"); return; }

    const headers = ["Name", "Email", "Phone", "Location", "Applied For", "Stage", "AI Score", "Skills"];
    const rows    = toExport.map((c) => [
      c.name ?? "", c.email ?? "", c.phone ?? "", c.location ?? "",
      c.appliedFor ?? "", c.stage ?? "", c.score ?? 0,
      (c.skills || []).join("; "),
    ]);
    const escape  = (val) => {
      const s = String(val);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv  = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `hireos-candidates-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${toExport.length} candidate${toExport.length !== 1 ? "s" : ""} exported successfully!`);
  };

  // ── Bulk Import CSV ─────────────────────────────────────────────────────────
  const parseCSV = (text) => {
    const lines   = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[\s"]/g, ""));
    return lines.slice(1).map((line) => {
      const cols = []; let cur = "", inQ = false;
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === "," && !inQ) { cols.push(cur); cur = ""; }
        else { cur += ch; }
      }
      cols.push(cur);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (cols[i] || "").trim(); });
      return obj;
    }).filter((r) => r.name || r.email);
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setBulkPreview(parseCSV(ev.target.result));
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (bulkPreview.length === 0) return;
    setBulkImporting(true);
    try {
      const result = await candidatesApi.bulkImport(bulkPreview);
      setBulkResult(result);
      if (result.created > 0) fetchCandidates();
      toast.success(`${result.created} candidates imported successfully!`);
    } catch (err) {
      toast.error(err.message || "Bulk import failed");
    } finally {
      setBulkImporting(false);
    }
  };

  const resetBulkDialog = () => {
    setBulkPreview([]); setBulkResult(null); setBulkOpen(false);
  };

  return (
    <div className="space-y-6" data-testid="candidates-page">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Talent</div>
          <h1 className="text-3xl font-display font-bold tracking-tight mt-1">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${candidates.length} candidate${candidates.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && <Badge variant="secondary">{selectedCount} selected</Badge>}

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1.5" />
            {selectedCount > 0 ? `Export ${selectedCount} selected` : "Export CSV"}
          </Button>

          {/* IMPORT CSV */}
          <Dialog open={bulkOpen} onOpenChange={(v) => { if (!v) resetBulkDialog(); else setBulkOpen(true); }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1.5" /> Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Import Candidates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Format hint */}
                <div className="rounded-md bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> CSV format:
                  </p>
                  <p>Required: <code className="font-mono bg-background px-1 rounded">name</code>, <code className="font-mono bg-background px-1 rounded">email</code></p>
                  <p>Optional: <code className="font-mono bg-background px-1 rounded">phone</code>, <code className="font-mono bg-background px-1 rounded">location</code>, <code className="font-mono bg-background px-1 rounded">appliedFor</code></p>
                  <p className="text-xs text-primary/80">Stage, score and skills are set automatically after AI resume screening.</p>
                </div>

                {/* File picker */}
                <div>
                  <Label>CSV File</Label>
                  <Input type="file" accept=".csv" className="mt-1.5 cursor-pointer" onChange={handleBulkFileChange} />
                </div>

                {/* Preview */}
                {bulkPreview.length > 0 && !bulkResult && (
                  <div>
                    <p className="text-sm font-medium mb-2">{bulkPreview.length} rows detected — preview (first 5):</p>
                    <div className="overflow-x-auto rounded-md border border-border">
                      <table className="w-full text-xs">
                        <thead className="bg-secondary/40">
                          <tr>
                            {["name","email","phone","location","appliedFor","stage","score"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left font-medium capitalize">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bulkPreview.slice(0, 5).map((row, i) => (
                            <tr key={i} className="border-t border-border">
                              {["name","email","phone","location","appliedfor","stage","score"].map((h) => (
                                <td key={h} className="px-3 py-1.5 text-muted-foreground max-w-[120px] truncate">{row[h] || "—"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {bulkPreview.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-1">...and {bulkPreview.length - 5} more rows</p>
                    )}
                  </div>
                )}

                {/* Result */}
                {bulkResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--success)" }}>
                      <CheckCircle2 className="h-4 w-4" />
                      {bulkResult.created} candidates imported successfully
                    </div>
                    {bulkResult.skipped > 0 && (
                      <p className="text-sm text-muted-foreground">{bulkResult.skipped} rows skipped (duplicate email)</p>
                    )}
                    {bulkResult.errors?.length > 0 && (
                      <div className="text-sm text-destructive flex items-start gap-1.5">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">{bulkResult.errors.length} errors:</p>
                          <ul className="mt-1 space-y-0.5">
                            {bulkResult.errors.slice(0, 3).map((e, i) => (
                              <li key={i} className="text-xs">{e.email}: {e.reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={resetBulkDialog}>{bulkResult ? "Close" : "Cancel"}</Button>
                {!bulkResult && (
                  <Button onClick={handleBulkImport} disabled={bulkPreview.length === 0 || bulkImporting}>
                    {bulkImporting
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing...</>
                      : `Import ${bulkPreview.length} candidates`
                    }
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ADD CANDIDATE */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-candidate-btn">
                <UserPlus className="h-4 w-4 mr-1.5" /> Add candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add a new Candidate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <Label>Full name *</Label>
                  <Input value={form.name} onChange={setF("name")} placeholder="Rahul Sharma" className="mt-1.5" required />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={setF("email")} placeholder="rahul@email.com" className="mt-1.5" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={setF("phone")} placeholder="+91 98765 43210" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={form.location} onChange={setF("location")} placeholder="Mumbai, IN" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Applied for (role) *</Label>
                  <Input value={form.appliedFor} onChange={setF("appliedFor")} placeholder="Frontend Developer" className="mt-1.5" required />
                </div>
                <div>
                  <Label>Link to job (optional)</Label>
                  <Select value={form.jobId} onValueChange={setF("jobId")} onOpenChange={loadJobs}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a job" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No job</SelectItem>
                      {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding…</> : "Add candidate"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <Card className="border border-border p-5 lg:col-span-1 h-fit space-y-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Search</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Name, skill, role…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">AI Score</div>
              <span className="font-mono text-xs">≥ {minScore[0]}</span>
            </div>
            <Slider value={minScore} onValueChange={setMinScore} min={0} max={100} step={1} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Stage</div>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {STAGES.map((s) => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setQuery(""); setMinScore([0]); setStage("all"); }}>
            Clear filters
          </Button>
        </Card>

        {/* Table */}
        <Card className="border border-border lg:col-span-3 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserPlus className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No candidate profiles are currently available</p>
              <p className="text-sm mt-1">Add your first candidate using the 'Add Candidate' button above.</p>
              <Button className="mt-4" onClick={() => setOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1.5" /> Add candidate
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr className="text-left">
                    <th className="px-4 py-3 w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></th>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Applied for</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">AI Score</th>
                    <th className="px-4 py-3 font-medium">Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-secondary/20">
                      <td className="px-4 py-3">
                        <Checkbox checked={!!selected[c.id]} onCheckedChange={(v) => setSelected((p) => ({ ...p, [c.id]: v }))} />
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/app/candidates/${c.id}`} className="flex items-center gap-3 hover:underline">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={c.avatarUrl} />
                            <AvatarFallback>{c.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.location}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{c.appliedFor}</td>
                      <td className="px-4 py-3">
                        <Select value={c.stage} onValueChange={(v) => handleStageChange(c.id, v)}>
                          <SelectTrigger className="h-7 w-32 border-0 p-0 shadow-none">
                            <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md ${stageColor[c.stage] ?? ""}`}>
                              {c.stage[0] + c.stage.slice(1).toLowerCase()}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => <SelectItem key={s} value={s.toUpperCase()}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${c.score}%` }} />
                          </div>
                          <span className="font-mono text-xs">{c.score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(c.skills || []).slice(0, 3).map((s) => (
                            <Badge key={s} variant="outline" className="text-xs py-0">{s}</Badge>
                          ))}
                          {(c.skills?.length ?? 0) > 3 && (
                            <Badge variant="outline" className="text-xs py-0">+{c.skills.length - 3}</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
