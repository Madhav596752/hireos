// Centralised dummy data for the AI Recruitment Platform frontend.

export const KPIS = [
    { label: "Total Applicants", value: "12,847", delta: "+18.2%", trend: "up" },
    { label: "Active Interviews", value: "342", delta: "+4.1%", trend: "up" },
    { label: "Hires this Quarter", value: "89", delta: "-2.7%", trend: "down" },
    { label: "Avg Time-to-Hire", value: "18d", delta: "-3.4d", trend: "up" },
];

export const FUNNEL_DATA = [
    { month: "Jan", applied: 1200, screened: 540, interviewed: 220, offered: 60 },
    { month: "Feb", applied: 1480, screened: 660, interviewed: 280, offered: 78 },
    { month: "Mar", applied: 1320, screened: 600, interviewed: 250, offered: 70 },
    { month: "Apr", applied: 1680, screened: 720, interviewed: 310, offered: 92 },
    { month: "May", applied: 1840, screened: 800, interviewed: 360, offered: 110 },
    { month: "Jun", applied: 2010, screened: 880, interviewed: 410, offered: 128 },
    { month: "Jul", applied: 2180, screened: 960, interviewed: 450, offered: 142 },
    { month: "Aug", applied: 2030, screened: 920, interviewed: 430, offered: 130 },
];

export const SOURCE_DATA = [
    { name: "LinkedIn", value: 38 },
    { name: "Referrals", value: 22 },
    { name: "Company Site", value: 18 },
    { name: "Indeed", value: 12 },
    { name: "Other", value: 10 },
];

export const DEPARTMENT_DATA = [
    { dept: "Engineering", open: 24, filled: 12 },
    { dept: "Design", open: 8, filled: 5 },
    { dept: "Product", open: 6, filled: 4 },
    { dept: "Sales", open: 14, filled: 9 },
    { dept: "Marketing", open: 5, filled: 3 },
    { dept: "Ops", open: 4, filled: 2 },
];

export const TIME_TO_HIRE = [
    { week: "W1", days: 24 },
    { week: "W2", days: 22 },
    { week: "W3", days: 21 },
    { week: "W4", days: 19 },
    { week: "W5", days: 20 },
    { week: "W6", days: 18 },
    { week: "W7", days: 17 },
    { week: "W8", days: 18 },
];

export const JOBS = [
    {
        id: "job-001",
        title: "Senior Frontend Engineer",
        department: "Engineering",
        location: "Remote · EU",
        type: "Full-time",
        status: "Open",
        applicants: 184,
        posted: "2026-01-12",
        salary: "$120k – $160k",
        owner: "Maya Chen",
        description:
            "We're looking for a senior frontend engineer with deep experience in React, TypeScript, and modern build tooling. You'll own large surfaces of our recruiter dashboard and partner with design to ship pixel-perfect UI.",
        requirements: [
            "5+ years building production React apps",
            "Strong TypeScript and accessibility fundamentals",
            "Experience with design systems",
            "Comfort owning features end-to-end",
        ],
    },
    {
        id: "job-002",
        title: "Product Designer, Growth",
        department: "Design",
        location: "Berlin",
        type: "Full-time",
        status: "Open",
        applicants: 96,
        posted: "2026-01-18",
        salary: "€80k – €110k",
        owner: "Liam Park",
        description:
            "Drive design across our growth funnel — from marketing site to onboarding. You'll partner with PMs and engineers to launch high-impact experiments weekly.",
        requirements: [
            "Strong portfolio of shipped product work",
            "Fluency in Figma + prototyping",
            "Experience with growth or marketing surfaces",
        ],
    },
    {
        id: "job-003",
        title: "Staff Machine Learning Engineer",
        department: "Engineering",
        location: "New York",
        type: "Full-time",
        status: "Open",
        applicants: 64,
        posted: "2026-01-22",
        salary: "$220k – $290k",
        owner: "Aditi Rao",
        description:
            "Lead applied ML for our resume parsing and candidate matching systems. You'll define our model strategy and mentor a small team.",
        requirements: [
            "PhD or 8+ years applied ML experience",
            "Strong NLP and embeddings background",
            "Production ML systems experience",
        ],
    },
    {
        id: "job-004",
        title: "Enterprise Account Executive",
        department: "Sales",
        location: "London",
        type: "Full-time",
        status: "Open",
        applicants: 142,
        posted: "2026-01-05",
        salary: "£90k OTE",
        owner: "Noah Williams",
        description:
            "Own the EMEA enterprise pipeline. Sell to talent acquisition leaders at 1000+ employee companies.",
        requirements: [
            "5+ years closing $100k+ ARR deals",
            "HR tech or SaaS background preferred",
        ],
    },
    {
        id: "job-005",
        title: "Talent Acquisition Partner",
        department: "Ops",
        location: "Remote · US",
        type: "Full-time",
        status: "Paused",
        applicants: 38,
        posted: "2025-12-19",
        salary: "$95k – $120k",
        owner: "Sofia Martinez",
        description:
            "Partner with hiring managers across the org to build pipeline and close top candidates.",
        requirements: ["3+ years in-house TA", "Tech sourcing chops"],
    },
    {
        id: "job-006",
        title: "Content Marketing Lead",
        department: "Marketing",
        location: "Remote · Global",
        type: "Full-time",
        status: "Draft",
        applicants: 0,
        posted: "2026-01-28",
        salary: "$110k – $140k",
        owner: "Maya Chen",
        description: "Define and execute our content strategy across blog, social, and webinars.",
        requirements: ["7+ years B2B content", "Strong writing samples"],
    },
    {
        id: "job-007",
        title: "DevOps Engineer",
        department: "Engineering",
        location: "Remote · EU",
        type: "Full-time",
        status: "Open",
        applicants: 73,
        posted: "2026-01-20",
        salary: "€85k – €120k",
        owner: "Aditi Rao",
        description: "Own our infrastructure across AWS, Kubernetes, and CI/CD.",
        requirements: ["Kubernetes in prod", "Terraform fluency"],
    },
    {
        id: "job-008",
        title: "Customer Success Manager",
        department: "Ops",
        location: "Austin",
        type: "Full-time",
        status: "Closed",
        applicants: 211,
        posted: "2025-11-08",
        salary: "$85k – $105k",
        owner: "Sofia Martinez",
        description: "Drive renewals and expansion across our mid-market book of business.",
        requirements: ["3+ years SaaS CSM", "Strong stakeholder mgmt"],
    },
];

const PORTRAITS = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80",
    "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&q=80",
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&q=80",
];

const FIRST_NAMES = [
    "Ava", "Liam", "Noah", "Emma", "Olivia", "Aarav", "Yuki", "Zara",
    "Kai", "Maya", "Ethan", "Sofia", "Leo", "Nina", "Omar", "Priya",
    "Hugo", "Iris", "Diego", "Mira",
];
const LAST_NAMES = [
    "Chen", "Patel", "Kowalski", "Nguyen", "Williams", "García",
    "Müller", "Tanaka", "Okafor", "Singh", "Park", "Ribeiro", "Rossi",
    "Andersson", "Hassan", "Cohen", "Martinez", "Bauer", "Khan", "Romanov",
];
const SKILLS = [
    "React", "TypeScript", "Node.js", "Python", "Go", "Kubernetes",
    "Figma", "Product Strategy", "GraphQL", "Tailwind", "ML", "NLP",
    "AWS", "PostgreSQL", "Design Systems", "Rust", "Swift", "Kotlin",
];
const STAGES = ["New", "Screened", "Interview", "Offer", "Hired", "Rejected"];

function pick(arr, i) {
    return arr[i % arr.length];
}

export const CANDIDATES = Array.from({ length: 28 }).map((_, i) => {
    const first = pick(FIRST_NAMES, i * 3);
    const last = pick(LAST_NAMES, i * 7);
    const job = pick(JOBS, i);
    const score = 60 + ((i * 13) % 39);
    const candidateSkills = [
        pick(SKILLS, i),
        pick(SKILLS, i + 4),
        pick(SKILLS, i + 9),
        pick(SKILLS, i + 13),
    ];
    return {
        id: `cand-${String(i + 1).padStart(3, "0")}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@mail.io`,
        phone: `+1 555 0${(100 + i).toString()}`,
        location: pick(
            ["Berlin", "London", "NYC", "SF", "Lisbon", "Toronto", "Singapore", "Remote"],
            i,
        ),
        avatar: pick(PORTRAITS, i),
        appliedFor: job.title,
        jobId: job.id,
        score,
        stage: pick(STAGES, i),
        skills: candidateSkills,
        experience: `${3 + (i % 12)} yrs`,
        appliedAt: `2026-01-${String((i % 27) + 1).padStart(2, "0")}`,
        summary:
            "Pragmatic builder with a track record of shipping high-quality product work. Strong design sensibility, deep technical chops, and a bias for action.",
        timeline: [
            { date: "2026-01-12", event: "Applied via LinkedIn" },
            { date: "2026-01-14", event: "Resume screened by AI · 92% match" },
            { date: "2026-01-18", event: "Phone screen with Maya Chen" },
            { date: "2026-01-22", event: "Technical interview scheduled" },
        ],
    };
});

export const RECENT_ACTIVITY = CANDIDATES.slice(0, 8).map((c) => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    role: c.appliedFor,
    stage: c.stage,
    score: c.score,
    when: `${(c.id.charCodeAt(5) % 9) + 1}h ago`,
}));

export const INTERVIEWS = [
    {
        id: "int-1",
        candidate: "Ava Chen",
        avatar: PORTRAITS[0],
        role: "Senior Frontend Engineer",
        time: "10:00 – 10:45",
        date: "2026-02-12",
        type: "Technical",
        location: "Google Meet",
    },
    {
        id: "int-2",
        candidate: "Liam Patel",
        avatar: PORTRAITS[1],
        role: "Product Designer, Growth",
        time: "11:30 – 12:15",
        date: "2026-02-12",
        type: "Portfolio Review",
        location: "Zoom",
    },
    {
        id: "int-3",
        candidate: "Noah Williams",
        avatar: PORTRAITS[2],
        role: "Staff ML Engineer",
        time: "14:00 – 15:00",
        date: "2026-02-13",
        type: "System Design",
        location: "Onsite · NYC",
    },
    {
        id: "int-4",
        candidate: "Emma Garcia",
        avatar: PORTRAITS[3],
        role: "Enterprise AE",
        time: "09:00 – 09:30",
        date: "2026-02-14",
        type: "Hiring Manager",
        location: "Google Meet",
    },
    {
        id: "int-5",
        candidate: "Yuki Tanaka",
        avatar: PORTRAITS[4],
        role: "DevOps Engineer",
        time: "16:00 – 16:45",
        date: "2026-02-14",
        type: "Final Round",
        location: "Zoom",
    },
];

export const CONVERSATIONS = [
    {
        id: "conv-1",
        name: "Ava Chen",
        avatar: PORTRAITS[0],
        role: "Senior Frontend Engineer",
        preview: "Thanks for the update — looking forward to the technical round.",
        time: "12m",
        unread: 2,
        messages: [
            { from: "them", text: "Hi Maya — really excited about the role!", time: "10:02" },
            { from: "me", text: "Glad to hear that Ava. We've moved you to the technical round.", time: "10:14" },
            { from: "them", text: "Thanks for the update — looking forward to the technical round.", time: "10:18" },
        ],
    },
    {
        id: "conv-2",
        name: "Liam Patel",
        avatar: PORTRAITS[1],
        role: "Product Designer",
        preview: "Sent over my updated portfolio link.",
        time: "1h",
        unread: 0,
        messages: [
            { from: "them", text: "Sent over my updated portfolio link.", time: "09:31" },
        ],
    },
    {
        id: "conv-3",
        name: "Noah Williams",
        avatar: PORTRAITS[2],
        role: "Staff ML Engineer",
        preview: "Would Tuesday at 2pm ET work?",
        time: "3h",
        unread: 1,
        messages: [
            { from: "them", text: "Would Tuesday at 2pm ET work?", time: "08:12" },
        ],
    },
    {
        id: "conv-4",
        name: "Emma Garcia",
        avatar: PORTRAITS[3],
        role: "Enterprise AE",
        preview: "Appreciate the feedback — happy to revise.",
        time: "Yesterday",
        unread: 0,
        messages: [
            { from: "them", text: "Appreciate the feedback — happy to revise.", time: "Yesterday" },
        ],
    },
    {
        id: "conv-5",
        name: "Yuki Tanaka",
        avatar: PORTRAITS[4],
        role: "DevOps Engineer",
        preview: "Just submitted the take-home.",
        time: "2d",
        unread: 0,
        messages: [
            { from: "them", text: "Just submitted the take-home.", time: "Mon 14:11" },
        ],
    },
];

export const PIPELINE_STAGES = ["New", "Screened", "Interview", "Offer", "Hired"];

export const PIPELINE = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = CANDIDATES.filter((c) => c.stage === stage).slice(0, 5);
    return acc;
}, {});

export const PRICING_PLANS = [
    {
        name: "Starter",
        price: "$0",
        period: "/mo",
        tagline: "For tiny teams just getting started.",
        features: [
            "1 active job posting",
            "Up to 50 candidates/month",
            "Basic AI screening",
            "Email support",
        ],
        cta: "Start free",
        highlight: false,
    },
    {
        name: "Growth",
        price: "$149",
        period: "/mo",
        tagline: "Everything you need to hire 1–10 roles.",
        features: [
            "10 active job postings",
            "Unlimited candidates",
            "Advanced AI matching & ranking",
            "Calendar integrations",
            "Priority support",
        ],
        cta: "Start 14-day trial",
        highlight: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        tagline: "For talent teams at 200+ employee companies.",
        features: [
            "Unlimited job postings",
            "Custom AI models on your data",
            "ATS integrations & SSO",
            "Dedicated CSM",
            "99.99% SLA",
        ],
        cta: "Talk to sales",
        highlight: false,
    },
];

export const FAQ = [
    {
        q: "Does HireOS replace my existing ATS?",
        a: "HireOS can fully replace lightweight ATS tools, or sit on top of greenhouse, lever and ashby via our integrations.",
    },
    {
        q: "How does the AI matching actually work?",
        a: "We extract structured skills, seniority, and trajectory signals from each resume and rank against your job description using a tuned embedding model.",
    },
    {
        q: "Is candidate data private?",
        a: "Yes. We're SOC 2 Type II compliant and never train shared models on your candidate data.",
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes — monthly plans are cancel-any-time. Annual plans are pro-rated.",
    },
];

export const LOGOS = ["Acme", "Globex", "Hooli", "Initech", "Soylent", "Umbrella"];

export const TESTIMONIALS = [
    {
        quote: "We cut time-to-hire by 41% in one quarter. The AI shortlist is uncannily accurate.",
        name: "Priya Singh",
        title: "Head of Talent · Linear-ish",
        avatar: PORTRAITS[5],
    },
    {
        quote: "Finally an ATS that doesn't feel like it was built in 2011.",
        name: "Hugo Bauer",
        title: "VP People · Northwave",
        avatar: PORTRAITS[6],
    },
    {
        quote: "Recruiters love it, hiring managers love it, candidates love it.",
        name: "Iris Kowalski",
        title: "CPO · Brightline",
        avatar: PORTRAITS[7],
    },
];

export const PARSED_RESUME_SAMPLE = {
    name: "Ava Chen",
    title: "Senior Frontend Engineer",
    email: "ava.chen@mail.io",
    phone: "+1 555 0142",
    location: "Berlin, DE",
    summary:
        "Frontend engineer with 7 years of experience building consumer and B2B SaaS products. Strong design sensibility, expert in React/TS, and shipping perf-critical UI.",
    matchScore: 92,
    skills: ["React", "TypeScript", "Next.js", "Tailwind", "Framer Motion", "Design Systems"],
    experience: [
        {
            company: "Linear-ish",
            role: "Senior Frontend Engineer",
            period: "2023 — Present",
            bullets: [
                "Led migration to React 18 + Suspense, reducing TTI by 38%.",
                "Owned design system across 4 squads.",
            ],
        },
        {
            company: "Northwave",
            role: "Frontend Engineer",
            period: "2020 — 2023",
            bullets: [
                "Built editor used by 200k+ monthly active users.",
                "Introduced E2E testing pipeline.",
            ],
        },
    ],
    education: [
        { school: "TU Berlin", degree: "B.Sc. Computer Science", year: "2018" },
    ],
    insights: [
        { label: "Skill match", score: 94, note: "9/10 required skills present" },
        { label: "Seniority", score: 88, note: "Consistent senior IC trajectory" },
        { label: "Culture signals", score: 86, note: "Open source contributor, writes publicly" },
        { label: "Risk flags", score: 12, note: "No red flags detected" },
    ],
};

export const USER = {
    name: "Maya Chen",
    email: "maya@hireos.io",
    role: "Head of Talent",
    avatar: PORTRAITS[8],
    company: "Linear-ish",
};

export const TEAM = [
    { name: "Maya Chen", role: "Head of Talent", email: "maya@hireos.io", avatar: PORTRAITS[8], status: "Owner" },
    { name: "Liam Park", role: "Recruiter", email: "liam@hireos.io", avatar: PORTRAITS[1], status: "Admin" },
    { name: "Aditi Rao", role: "Tech Recruiter", email: "aditi@hireos.io", avatar: PORTRAITS[5], status: "Member" },
    { name: "Sofia Martinez", role: "Coordinator", email: "sofia@hireos.io", avatar: PORTRAITS[3], status: "Member" },
    { name: "Noah Williams", role: "Sourcer", email: "noah@hireos.io", avatar: PORTRAITS[2], status: "Member" },
];

export const INTEGRATIONS = [
    { name: "Slack", desc: "Get hiring notifications in your channels.", connected: true },
    { name: "Google Calendar", desc: "Two-way sync for interviews.", connected: true },
    { name: "Greenhouse", desc: "Sync candidates & jobs.", connected: false },
    { name: "LinkedIn", desc: "Post jobs and source candidates.", connected: true },
    { name: "Zoom", desc: "Auto-create interview links.", connected: false },
    { name: "Notion", desc: "Push interview notes to docs.", connected: false },
];

export const NOTIFICATIONS = [
    { id: 1, text: "Ava Chen accepted your interview invite.", time: "2m" },
    { id: 2, text: "5 new candidates matched 'Senior FE Engineer'.", time: "1h" },
    { id: 3, text: "Liam Park added notes on Noah Williams.", time: "3h" },
    { id: 4, text: "Job 'DevOps Engineer' crossed 50 applicants.", time: "Yesterday" },
];
