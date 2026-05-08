import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Newspaper, CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface Project { id: string; name: string; }
interface Update {
  id: string;
  title: string;
  summary: string | null;
  photo_url: string | null;
  update_date: string;
  created_at: string;
}

export default function PortalDailyUpdates() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
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
    if (!selectedProject) { setUpdates([]); return; }
    (async () => {
      const { data } = await supabase
        .from("project_daily_updates")
        .select("*")
        .eq("project_id", selectedProject)
        .order("update_date", { ascending: false });
      setUpdates((data as Update[]) || []);
    })();
  }, [selectedProject]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground">Daily Updates</h1>
          <p className="text-muted-foreground">Field reports from your project team</p>
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
      ) : updates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No updates yet</h3>
            <p className="text-muted-foreground">Your contractor will post daily progress updates here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((u) => (
            <Card key={u.id} className="overflow-hidden">
              {u.photo_url && <img src={u.photo_url} alt={u.title} className="w-full h-56 object-cover" />}
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <CalendarDays className="w-3 h-3" />
                  {format(new Date(u.update_date), "EEEE, MMM d, yyyy")}
                </div>
                <h3 className="font-display text-lg mb-2">{u.title}</h3>
                {u.summary && <p className="text-sm text-foreground/80 whitespace-pre-line">{u.summary}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}