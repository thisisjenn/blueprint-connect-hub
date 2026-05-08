import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

interface Project { id: string; name: string; }
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
}

export default function PortalSchedule() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("projects").select("id, name").eq("client_id", user.id);
      setProjects(data || []);
      if (data && data.length > 0) setSelectedProject(data[0].id);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!selectedProject) { setTasks([]); return; }
    (async () => {
      const { data } = await supabase
        .from("project_tasks")
        .select("id, title, description, status, due_date, completed_at")
        .eq("project_id", selectedProject)
        .order("due_date", { ascending: true, nullsFirst: false });
      setTasks((data as Task[]) || []);
    })();
  }, [selectedProject]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Upcoming milestones for your project</p>
        </div>
        {projects.length > 1 && (
          <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {projects.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No projects assigned yet.</CardContent></Card>
      ) : tasks.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No scheduled milestones yet.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Project Timeline</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative border-l-2 border-border ml-3 space-y-6">
              {tasks.map((t) => {
                const completed = t.status === "completed" || !!t.completed_at;
                const overdue = !completed && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date));
                return (
                  <li key={t.id} className="ml-6">
                    <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-border">
                      {completed ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Circle className="w-3 h-3 text-muted-foreground" />}
                    </span>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium">{t.title}</h3>
                        {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
                        {t.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Clock className="w-3 h-3" /> {format(new Date(t.due_date), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                      <Badge variant={completed ? "secondary" : overdue ? "destructive" : "outline"}>
                        {completed ? "Done" : overdue ? "Overdue" : t.status}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}