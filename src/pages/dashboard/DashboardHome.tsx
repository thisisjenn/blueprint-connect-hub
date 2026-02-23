import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Users,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow } from "date-fns";

function formatDueLabel(d: string | null) {
  if (!d) return "No date";
  try {
    const date = new Date(d);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  } catch {
    return d;
  }
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return format(new Date(d), "MMM d, yyyy");
  } catch {
    return d;
  }
}

export default function DashboardHome() {
  const navigate = useNavigate();

  // Fetch projects with tasks
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_tasks(id, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch clients count
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["dashboard-clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name, email");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch pending tasks with due dates
  const { data: upcomingTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["dashboard-upcoming-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tasks")
        .select("id, title, due_date, status, project_id")
        .neq("status", "completed")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch files count
  const { data: filesCount = 0 } = useQuery({
    queryKey: ["dashboard-files-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("project_files")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Compute stats
  const activeJobsCount = projects.filter((p: any) => p.status === "active").length;
  const pendingTasksCount = upcomingTasks.length;
  const todayTasksCount = upcomingTasks.filter(
    (t: any) => t.due_date && isToday(new Date(t.due_date))
  ).length;

  const stats = [
    {
      title: "Active Jobs",
      value: String(activeJobsCount),
      change: `${projects.length} total`,
      icon: Briefcase,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Total Clients",
      value: String(clients.length),
      change: "",
      icon: Users,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending Tasks",
      value: String(pendingTasksCount),
      change: todayTasksCount > 0 ? `${todayTasksCount} due today` : "",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Documents",
      value: String(filesCount),
      change: "",
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  // Recent jobs (top 4)
  const recentJobs = projects.slice(0, 4).map((p: any) => {
    const tasks = p.project_tasks ?? [];
    const completed = tasks.filter((t: any) => t.status === "completed").length;
    const total = tasks.length;
    return {
      id: p.id,
      name: p.name,
      status: p.status ?? "active",
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      dueDate: formatDate(p.end_date),
      clientId: p.client_id,
    };
  });

  // Get client name helper
  const getClientName = (clientId: string | null) => {
    if (!clientId) return "No client";
    // Simple fallback — we don't have profile→email→client mapping here, just show client_record_id match
    return "Client";
  };

  const isLoading = projectsLoading || clientsLoading || tasksLoading;

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
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                    )}
                    {stat.change && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change}
                      </p>
                    )}
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
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => navigate("/dashboard/jobs")}
              >
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : recentJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No jobs yet. Create your first job to get started.
                </p>
              ) : (
                recentJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate("/dashboard/jobs")}
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
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate("/dashboard/jobs")}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksLoading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No pending tasks.
                </p>
              ) : (
                upcomingTasks.map((task: any) => {
                  const isDueToday = task.due_date && isToday(new Date(task.due_date));
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => navigate("/dashboard/jobs")}
                    >
                      <div className="mt-0.5">
                        {isDueToday ? (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-success transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDueLabel(task.due_date)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
