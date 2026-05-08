import { Link } from "react-router-dom";
import { 
  HardHat, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Users, 
  FolderOpen, 
  MessageSquare,
  FileText,
  Calendar,
  Shield,
  Zap,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-blueprint.jpg";

const features = [
  {
    icon: Briefcase,
    title: "Workflow Management",
    description: "Manage jobs, tasks, checklists, and recurring work with ease. Keep everything organized in one place.",
  },
  {
    icon: MessageSquare,
    title: "Client Communication",
    description: "Centralized messaging, email inbox, and client tasks. Never miss an important update.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Schedule work, share notes, pin important items, and keep your team aligned.",
  },
  {
    icon: FolderOpen,
    title: "Document Management",
    description: "Easy file uploads, organized folders, and seamless sharing with clients and team members.",
  },
  {
    icon: FileText,
    title: "Contract Management",
    description: "Custom forms, invoicing, payments, and work orders—all in one professional toolkit.",
  },
  {
    icon: Calendar,
    title: "MasterPlan Dashboard",
    description: "Track jobs, client tasks, time, and details with comprehensive overview dashboards.",
  },
];

const benefits = [
  { icon: Zap, text: "Save 10+ hours per week on admin tasks" },
  { icon: Shield, text: "Secure document storage & sharing" },
  { icon: Clock, text: "Real-time project tracking" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <HardHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-foreground">
                BlueprintHub
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="hero" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Built for Construction Professionals
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Manage Projects{" "}
                <span className="text-gradient-accent">Like a Pro</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                The all-in-one project management platform for draftsmen, contractors, and homeowners. 
                Streamline workflows, communicate better, and deliver projects on time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-8">
                <Link to="/dashboard">
                  <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <benefit.icon className="w-4 h-4 text-accent" />
                    {benefit.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-up animation-delay-300">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={heroImage}
                  alt="BlueprintHub Dashboard Preview"
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
                      <p className="text-2xl font-bold text-foreground">2,500+</p>
                      <p className="text-sm text-muted-foreground">Projects Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to{" "}
              <span className="text-gradient-accent">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From initial plans to final handover, BlueprintHub keeps your projects on track and your clients happy.
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
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
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
