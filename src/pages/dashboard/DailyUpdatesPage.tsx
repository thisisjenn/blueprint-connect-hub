import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Newspaper, Plus, Trash2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Project { id: string; name: string; }
interface Update {
  id: string;
  project_id: string;
  title: string;
  summary: string | null;
  photo_url: string | null;
  update_date: string;
  created_at: string;
}

export default function DailyUpdatesPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [updateDate, setUpdateDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("projects").select("id, name").eq("contractor_id", user.id);
      setProjects(data || []);
      if (data && data.length > 0) setSelectedProject(data[0].id);
      setLoading(false);
    })();
  }, [user]);

  const fetchUpdates = async (pid: string) => {
    const { data } = await supabase
      .from("project_daily_updates")
      .select("*")
      .eq("project_id", pid)
      .order("update_date", { ascending: false });
    setUpdates((data as Update[]) || []);
  };

  useEffect(() => {
    if (selectedProject) fetchUpdates(selectedProject); else setUpdates([]);
  }, [selectedProject]);

  const reset = () => { setTitle(""); setSummary(""); setPhotoUrl(""); setUpdateDate(format(new Date(), "yyyy-MM-dd")); };

  const submit = async () => {
    if (!user || !selectedProject || !title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("project_daily_updates").insert({
      project_id: selectedProject,
      posted_by: user.id,
      title: title.trim(),
      summary: summary.trim() || null,
      photo_url: photoUrl.trim() || null,
      update_date: updateDate,
    });
    setSaving(false);
    if (error) { toast.error("Failed to post update"); return; }
    toast.success("Update posted — your client will be notified");
    setOpen(false);
    reset();
    fetchUpdates(selectedProject);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("project_daily_updates").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setUpdates(updates.filter(u => u.id !== id));
  };

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground">Daily Updates</h1>
          <p className="text-muted-foreground">Post field reports for your clients</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button disabled={!selectedProject} className="gap-2"><Plus className="w-4 h-4" /> New Update</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post Daily Update</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Drywall complete in kitchen" /></div>
                <div className="space-y-2"><Label>Summary</Label><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder="What happened on site today?" /></div>
                <div className="space-y-2"><Label>Photo URL (optional)</Label><Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" /></div>
                <Button className="w-full" onClick={submit} disabled={saving || !title.trim()}>{saving ? "Posting…" : "Post Update"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Create a project first to post updates.</CardContent></Card>
      ) : updates.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No updates yet for this project.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {updates.map((u) => (
            <Card key={u.id} className="overflow-hidden">
              {u.photo_url && <img src={u.photo_url} alt={u.title} className="w-full h-56 object-cover" />}
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><CalendarDays className="w-3 h-3" /> {format(new Date(u.update_date), "EEEE, MMM d, yyyy")}</div>
                    <h3 className="font-display text-lg mb-2">{u.title}</h3>
                    {u.summary && <p className="text-sm text-foreground/80 whitespace-pre-line">{u.summary}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}