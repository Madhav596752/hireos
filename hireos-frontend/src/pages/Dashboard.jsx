// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowDown, ArrowUp, Plus, RefreshCw, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardApi } from "@/api/dashboard";
import { useAuth } from "@/context/AuthContext";
import { FUNNEL_DATA, SOURCE_DATA, DEPARTMENT_DATA, TIME_TO_HIRE } from "@/data/dummy";

const CHART_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))",
];

const stageColor = {
  NEW:       "bg-secondary text-foreground",
  SCREENED:  "bg-primary/10 text-primary",
  INTERVIEW: "bg-warning/15 text-warning",
  OFFER:     "bg-success/15 text-success",
  HIRED:     "bg-success text-white",
  REJECTED:  "bg-destructive/15 text-destructive",
};

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover text-popover-foreground text-xs px-3 py-2 shadow-md">
      <div className="font-medium mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}</span>
          <span className="ml-auto font-mono">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Dashboard load error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const kpis           = stats?.kpis          ?? [];
  const recentActivity = stats?.recentActivity ?? [];
  const pipeline       = stats?.pipeline       ?? {};

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "";

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Overview</div>
          <h1 className="text-3xl font-display font-bold tracking-tight mt-1">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across your hiring pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchStats(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link to="/app/jobs">
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> New job</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.length === 0 ? (
          // Empty state for new users
          [
            { label: "Total Applicants", value: "0" },
            { label: "Active Interviews", value: "0" },
            { label: "Hires this Quarter", value: "0" },
            { label: "Open Jobs", value: "0" },
          ].map((k) => (
            <Card key={k.label} className="p-5 border border-border">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{k.label}</div>
              <div className="text-3xl font-display font-bold mt-3">{k.value}</div>
            </Card>
          ))
        ) : (
          kpis.map((k) => (
            <Card key={k.label} className="p-5 border border-border">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{k.label}</div>
              <div className="flex items-end justify-between mt-3">
                <div className="text-3xl font-display font-bold">{k.value}</div>
                {k.delta && (
                  <div className={`text-xs font-mono flex items-center gap-1 ${k.trend === "up" ? "text-success" : "text-destructive"}`}>
                    {k.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {k.delta}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pipeline counts — live data */}
      {Object.values(pipeline).some((v) => v > 0) && (
        <Card className="p-5 border border-border">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Pipeline</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: "New",       val: pipeline.new,       color: "bg-secondary" },
              { label: "Screened",  val: pipeline.screened,  color: "bg-primary/20" },
              { label: "Interview", val: pipeline.interview, color: "bg-warning/20" },
              { label: "Offer",     val: pipeline.offer,     color: "bg-success/20" },
              { label: "Hired",     val: pipeline.hired,     color: "bg-success" },
              { label: "Rejected",  val: pipeline.rejected,  color: "bg-destructive/20" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-2xl font-display font-bold`}>{s.val}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts — static demo data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border border-border lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Hiring funnel</div>
              <h3 className="font-display text-lg font-semibold mt-1">Applicants → Offers</h3>
            </div>
            <Badge variant="outline">Demo data</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FUNNEL_DATA}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_COLORS[1]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<TooltipBox />} />
                <Area type="monotone" dataKey="applied"     stroke={CHART_COLORS[0]} fill="url(#g1)" />
                <Area type="monotone" dataKey="screened"    stroke={CHART_COLORS[1]} fill="url(#g2)" />
                <Area type="monotone" dataKey="interviewed" stroke={CHART_COLORS[2]} fillOpacity={0} />
                <Area type="monotone" dataKey="offered"     stroke={CHART_COLORS[4]} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Source breakdown</div>
          <h3 className="font-display text-lg font-semibold mt-1 mb-4">Where applicants come from</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {SOURCE_DATA.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {SOURCE_DATA.map((s, i) => (
              <div key={s.name} className="flex items-center text-xs">
                <span className="h-2 w-2 rounded-full mr-2" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-mono">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity — live data */}
      <Card className="border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Live</div>
            <h3 className="font-display text-lg font-semibold mt-1">Recent applications</h3>
          </div>
          <Link to="/app/candidates">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-medium">There are no candidates right now</p>
            <p className="text-sm mt-1">Post jobs and add candidates.</p>
            <Link to="/app/candidates">
              <Button size="sm" className="mt-4">Add candidate</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr className="text-left">
                  <th className="px-6 py-3 font-medium">Candidate</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Stage</th>
                  <th className="px-6 py-3 font-medium">AI Score</th>
                  <th className="px-6 py-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-6 py-3">
                      <Link to={`/app/candidates/${r.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={r.avatarUrl} />
                          <AvatarFallback>{r.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{r.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{r.appliedFor}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md ${stageColor[r.stage] ?? ""}`}>
                        {r.stage[0] + r.stage.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${r.score}%` }} />
                        </div>
                        <span className="font-mono text-xs">{r.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-xs">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
