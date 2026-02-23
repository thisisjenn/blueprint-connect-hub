import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  CheckCircle2,
  MapPin,
  FolderOpen,
  Inbox,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddJobDialog } from "@/components/jobs/AddJobDialog";
import { AddTaskDialog } from "@/components/jobs/AddTaskDialog";
import { format } from "date-fns";

type JobStatus = "all" | "active" | "pending" | "completed";

interface JobWithMeta {
  id: string;
  name: string;
  status: string | null;
  address: string | null;
  end_date: string | null;
  start_date: string | null;
  description: string | null;
  client_id: string | null;
  clientName: string | null;
  completedTasks: number;
  totalTasks: number;
  progress: number;
}

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<JobStatus>("all");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddJob, setShowAddJob] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Fetch jobs with client names and task counts
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const [projectsRes, clientsRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*, project_tasks(id, status)")
          .order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name"),
      ]);
      if (projectsRes.error) throw projectsRes.error;

      // Map by client id since projects.client_id stores the client's table id
      const clientMap = new Map(
        (clientsRes.data ?? []).map((c: any) => [c.id, c.name])
      );

      return (projectsRes.data ?? []).map((p: any): JobWithMeta => {
        const tasks = p.project_tasks ?? [];
        const completed = tasks.filter((t: any) => t.status === "completed").length;
        const total = tasks.length;
        return {
          id: p.id,
          name: p.name,
          status: p.status,
          address: p.address,
          end_date: p.end_date,
          start_date: p.start_date,
          description: p.description,
          client_id: p.client_id,
          clientName: p.client_id ? clientMap.get(p.client_id) ?? null : null,
          completedTasks: completed,
          totalTasks: total,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });
    },
  });

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? jobs[0] ?? null;

  // Fetch tasks for selected job
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", selectedJob?.id],
    enabled: !!selectedJob,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", selectedJob!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Toggle task
  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("project_tasks")
        .update({
          status: completed ? "completed" : "pending",
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", selectedJob?.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  // Delete job
  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setSelectedJobId(null);
      toast.success("Job deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === "all" || job.status === filter;
    const matchesSearch =
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.clientName ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try { return format(new Date(d), "MMM d, yyyy"); } catch { return d; }
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Jobs" subtitle="Manage and track all your construction projects" />

      <div className="flex-1 overflow-hidden flex">
        {/* Jobs List */}
        <div className="w-full lg:w-[400px] border-r border-border flex flex-col">
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as JobStatus)} className="flex-1">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Done</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {jobsLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <Inbox className="w-10 h-10 mb-2" />
                <p className="text-sm">No jobs found</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${
                    selectedJob?.id === job.id ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{job.name}</h4>
                      <p className="text-sm text-muted-foreground">{job.clientName ?? "No client"}</p>
                    </div>
                    <Badge variant={job.status === "active" ? "active" : job.status === "completed" ? "completed" : "pending"}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(job.end_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {job.completedTasks}/{job.totalTasks}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={job.progress} className="h-1" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border">
            <Button variant="accent" className="w-full gap-2" onClick={() => setShowAddJob(true)}>
              <Plus className="w-4 h-4" />
              New Job
            </Button>
          </div>
        </div>

        {/* Job Details */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          {selectedJob ? (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-semibold text-foreground">{selectedJob.name}</h2>
                      <Badge variant={selectedJob.status === "active" ? "active" : selectedJob.status === "completed" ? "completed" : "pending"}>
                        {selectedJob.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedJob.clientName ?? "No client"}
                      </div>
                      {selectedJob.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedJob.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Job</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteJob.mutate(selectedJob.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{selectedJob.progress}%</span>
                    </div>
                    <Progress value={selectedJob.progress} className="h-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(selectedJob.end_date)}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="tasks" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b border-border">
                  <TabsList className="h-12 bg-transparent gap-4">
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-muted">Tasks</TabsTrigger>
                    <TabsTrigger value="files" className="data-[state=active]:bg-muted">Files</TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-muted">Notes</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="tasks" className="flex-1 overflow-auto p-6 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Task Checklist</h3>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowAddTask(true)}>
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </div>
                  {tasksLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks yet. Add one to get started.</p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={task.status === "completed"}
                            onCheckedChange={(checked) =>
                              toggleTask.mutate({ id: task.id, completed: !!checked })
                            }
                          />
                          <span className={`flex-1 text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.title}
                          </span>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">{formatDate(task.due_date)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="files" className="flex-1 overflow-auto p-6 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Project Files</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">File management coming soon.</p>
                </TabsContent>

                <TabsContent value="notes" className="flex-1 overflow-auto p-6 mt-0">
                  <h3 className="font-semibold mb-4">Project Notes</h3>
                  {selectedJob.description ? (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <p className="text-sm text-muted-foreground">No description added.</p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FolderOpen className="w-12 h-12 mb-3" />
              <p>Select a job to view details</p>
            </div>
          )}
        </div>
      </div>

      <AddJobDialog open={showAddJob} onOpenChange={setShowAddJob} />
      {selectedJob && (
        <AddTaskDialog open={showAddTask} onOpenChange={setShowAddTask} projectId={selectedJob.id} />
      )}
    </div>
  );
}
