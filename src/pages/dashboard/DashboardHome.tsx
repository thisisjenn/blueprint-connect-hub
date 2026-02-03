import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";

const stats = [
  {
    title: "Active Jobs",
    value: "12",
    change: "+2 this week",
    icon: Briefcase,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    title: "Total Clients",
    value: "48",
    change: "+5 this month",
    icon: Users,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Pending Tasks",
    value: "23",
    change: "7 due today",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Documents",
    value: "156",
    change: "+12 this week",
    icon: FileText,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const recentJobs = [
  {
    id: 1,
    name: "Smith Residence Renovation",
    client: "John Smith",
    status: "active",
    progress: 65,
    dueDate: "Feb 15, 2024",
  },
  {
    id: 2,
    name: "Oak Street Commercial Building",
    client: "ABC Corp",
    status: "pending",
    progress: 20,
    dueDate: "Mar 1, 2024",
  },
  {
    id: 3,
    name: "Riverside Apartment Plans",
    client: "Green Developers",
    status: "completed",
    progress: 100,
    dueDate: "Jan 28, 2024",
  },
  {
    id: 4,
    name: "Downtown Office Renovation",
    client: "Tech Solutions Inc",
    status: "active",
    progress: 45,
    dueDate: "Feb 28, 2024",
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: "Review floor plans for Smith residence",
    dueDate: "Today",
    priority: "high",
  },
  {
    id: 2,
    title: "Client meeting - Oak Street project",
    dueDate: "Tomorrow",
    priority: "medium",
  },
  {
    id: 3,
    title: "Submit permit application",
    dueDate: "Feb 5",
    priority: "high",
  },
  {
    id: 4,
    title: "Update project timeline",
    dueDate: "Feb 6",
    priority: "low",
  },
];

export default function DashboardHome() {
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your projects."
      />
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Jobs</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">
                        {job.name}
                      </h4>
                      <Badge
                        variant={
                          job.status === "active"
                            ? "active"
                            : job.status === "completed"
                            ? "completed"
                            : "pending"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.client}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 max-w-[200px]">
                        <Progress value={job.progress} className="h-1.5" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {job.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {job.dueDate}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
              <Button variant="ghost" size="icon-sm">
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <div className="mt-0.5">
                    {task.priority === "high" ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-success transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {task.dueDate}
                      </span>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "priority-high"
                            : task.priority === "medium"
                            ? "priority-medium"
                            : "priority-low"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
