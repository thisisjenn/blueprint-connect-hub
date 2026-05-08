import { Link } from "react-router-dom";
import { 
  HardHat, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  MessageSquare,
  Calendar,
  Zap,
  Sparkles,
  Wallet,
  LayoutDashboard,
  ShieldCheck,
  GitCompareArrows,
  BookOpen,
  Home,
  Hammer,
  Compass,
  Package,
  GitBranch,
  HeartPulse,
  AlertTriangle,
  PiggyBank,
  History,
  ImageIcon,
  Store,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-blueprint.jpg";

const features = [
  {
    icon: Sparkles,
    title: "AI Design-to-Scope Translator",
    description: 'Type "I want a spa-like bathroom" and get tile allowance, vanity type, lighting package, plumbing fixtures, waterproofing scope, and a budget range — instantly.',
  },
  {
    icon: Wallet,
    title: "Live Budget & Schedule Impact Engine",
    description: 'Every design decision updates cost, timeline, and procurement in real time. Change a countertop → see "+$4,200, no delay" or "+$9,800, +3 weeks."',
  },
  {
    icon: LayoutDashboard,
    title: "Visual Homeowner Dashboard",
    description: "Tap any room in a floor plan to see material status, contractor schedule, pending approvals, and live budget — no spreadsheets required.",
  },
  {
    icon: ShieldCheck,
    title: "AI Permit Readiness Checker",
    description: "Upload drawings and AI flags missing electrical plans, ventilation notes, setback violations, HOA conflicts, and structural risks before submission.",
  },
  {
    icon: GitCompareArrows,
    title: "Change Order Simulator",
    description: '"What-if" explorer before approval. Compare options side by side with cost, delay, and tradeoff breakdowns the homeowner actually understands.',
  },
  {
    icon: BookOpen,
    title: "Post-Project Digital Home Manual",
    description: "Auto-generated owner's manual with paint colors, warranties, maintenance schedules, contractor records, and as-built photos.",
  },
];

const painPoints = [
  {
    title: "Scattered Decisions",
    description: "Fixtures live in one chat, tile in another, schedules in a PDF. Nothing connects.",
  },
  {
    title: "Surprise Costs",
    description: "Homeowners learn about a $9k overage two weeks after the change was made.",
  },
  {
    title: "Contractor Miscommunication",
    description: "Drawings, estimates, and contracts disagree — and no one notices until rework starts.",
  },
];

const steps = [
  {
    n: "01",
    title: "Upload your plans, inspiration photos, and project details",
    description: "Drag in floor plans, magazine clippings, contractor estimates — anything you've collected.",
  },
  {
    n: "02",
    title: "AI translates your vision into scope, budget, and schedule",
    description: "Get itemized scope, allowance ranges, sequencing, and a permit readiness check.",
  },
  {
    n: "03",
    title: "Manage every decision, approval, and contractor in one place",
    description: "Real-time dashboards keep homeowners, designers, and pros aligned through move-in day.",
  },
];

const audiences = [
  {
    icon: Home,
    emoji: "🏠",
    title: "Homeowners",
    description: "Stay informed without spreadsheets, group texts, or guessing what comes next.",
  },
  {
    icon: Hammer,
    emoji: "🔨",
    title: "Contractors & Builders",
    description: "Streamline client communication, change orders, and material logistics — in one workspace.",
  },
  {
    icon: Compass,
    emoji: "🎨",
    title: "Architects & Designers",
    description: "Bridge design intent and construction execution without losing details in translation.",
  },
];

const additionalFeatures = [
  { icon: Mic, title: "AI Meeting-to-Project Update Automation" },
  { icon: Package, title: "Real-Time Material Availability & Substitution" },
  { icon: GitBranch, title: "Design Decision Dependency Map" },
  { icon: HeartPulse, title: "Homeowner Emotional Risk Dashboard" },
  { icon: AlertTriangle, title: "AI Conflict Detector (drawings vs estimates)" },
  { icon: PiggyBank, title: "Homeowner Financing & Affordability Planner" },
  { icon: History, title: "Unified Design Provenance & Version History" },
  { icon: ImageIcon, title: "AI Daily Visual Progress Reports" },
  { icon: Store, title: "Marketplace-Neutral Vendor Recommendations" },
];

const testimonials = [
  {
    name: "Sarah & Mike Reynolds",
    role: "Homeowners — Whole-house renovation",
    quote: "For the first time we actually understood what every change cost — before we approved it. Felt like flying with instruments instead of guessing.",
  },
  {
    name: "Daniel Okafor",
    role: "GC — Okafor Building Co.",
    quote: "The AI permit checker caught two missing sheets before submittal. That alone saved us a 3-week delay on the Hayes addition.",
  },
  {
    name: "Priya Mehta",
    role: "Principal — Mehta Studio Architecture",
    quote: "Finally a tool where the design decisions actually flow into construction. Our handoffs are dramatically cleaner.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary border border-accent/40">
                <HardHat className="w-5 h-5 text-accent" />
              </div>
              <span className="font-display text-xl tracking-tight text-foreground">
                Blueprint Hub
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#who-its-for" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                For Pros
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" size="sm">
                  Get Early Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                AI-Powered Residential Construction OS
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-6">
                From Inspiration to{" "}
                <span className="text-gradient-accent">Move-In Day</span>
                {" "}— Managed in One Place
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                Blueprint Hub connects your home design decisions to budgets, schedules, materials, permits, and contractor workflows in real time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-8">
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                    Get Early Access
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                    See How It Works
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-300">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={heroImage}
                  alt="Blueprint Hub dashboard preview showing live budget, schedule, and design decisions"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              
              {/* Floating Stats Card */}
              <Card className="absolute -bottom-6 -left-6 shadow-lg animate-float hidden lg:block">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-display text-2xl text-foreground">+$4,200</p>
                      <p className="text-sm text-muted-foreground">Quartz upgrade · no delay</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 animate-fade-in-up">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              Home renovations shouldn't feel like chaos.
            </h2>
            <p className="text-lg text-muted-foreground">
              The tools you've been using were built for office work — not for building a home.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((p, i) => (
              <Card key={i} className="border-border hover-lift">
                <CardContent className="p-7">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              What Blueprint Hub{" "}
              <span className="text-gradient-accent">Does</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Six AI-powered systems that translate design decisions into real-world cost, time, and scope.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover-lift bg-card border-border"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid-subtle opacity-40 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              How It <span className="text-gradient-accent">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From first inspiration photo to a finished home, in three connected steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <Card key={s.n} className="border-border hover-lift bg-card">
                <CardContent className="p-7">
                  <div className="font-display text-3xl text-accent mb-3">{s.n}</div>
                  <h3 className="font-display text-xl text-foreground mb-3 leading-snug">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section id="who-its-for" className="py-20 lg:py-28 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              Who It's <span className="text-gradient-accent">For</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              One platform, three views — purpose-built for everyone at the table.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a) => (
              <Card key={a.title} className="border-border hover-lift">
                <CardContent className="p-7">
                  <div className="text-3xl mb-3" aria-hidden>{a.emoji}</div>
                  <h3 className="font-display text-xl text-foreground mb-2">{a.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{a.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              And a deep bench of <span className="text-gradient-accent">AI assistants</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Smaller tools that quietly remove friction from every week of the project.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalFeatures.map((f) => (
              <Card key={f.title} className="border-border hover-lift">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug">{f.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              Trusted by <span className="text-gradient-accent">homeowners and pros</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border hover-lift bg-card">
                <CardContent className="p-7">
                  <p className="text-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Card className="max-w-3xl mx-auto border-accent/30 bg-card shadow-xl">
            <CardContent className="p-10 text-center">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-3">
                Be First to <span className="text-gradient-accent">Build Smarter.</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Limited beta spots — launching 2025.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="you@yourhome.com"
                  className="flex-1 h-12 rounded-lg border border-input bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="submit" variant="hero" size="lg">
                  Join the Waitlist
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent{" "}
              <span className="text-gradient-accent">Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your business. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="relative border-border hover-lift">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-foreground mb-1">Starter</h3>
                <p className="text-sm text-muted-foreground mb-6">For solo contractors</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">$29</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                  {["Up to 5 active projects", "Client portal", "Document storage (5 GB)", "Email support"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional */}
            <Card className="relative border-accent shadow-lg hover-lift ring-2 ring-accent/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-foreground mb-1">Professional</h3>
                <p className="text-sm text-muted-foreground mb-6">For growing teams</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">$79</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                  {["Unlimited projects", "Client portal & messaging", "Document storage (50 GB)", "Contract management", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button variant="hero" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="relative border-border hover-lift">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-foreground mb-1">Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-6">For large firms</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">$199</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                  {["Everything in Professional", "Unlimited storage", "Custom branding", "API access", "Dedicated account manager"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Get in <span className="text-gradient-accent">Touch</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Have questions or need a custom solution? Our team is here to help you find the right fit.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Chat with us</h4>
                    <p className="text-sm text-muted-foreground">Our team typically replies within 2 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Schedule a demo</h4>
                    <p className="text-sm text-muted-foreground">See BlueprintHub in action with a personalized walkthrough.</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-border">
              <CardContent className="p-8">
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">First Name</label>
                      <input type="text" placeholder="John" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Last Name</label>
                      <input type="text" placeholder="Doe" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input type="email" placeholder="john@company.com" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Message</label>
                    <textarea rows={4} placeholder="Tell us about your project..." className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                  </div>
                  <Button variant="hero" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <HardHat className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">BlueprintHub</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2024 BlueprintHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
