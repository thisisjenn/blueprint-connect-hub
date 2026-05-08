import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Project { id: string; name: string; }
interface Selection {
  id: string;
  project_id: string;
  title: string;
  option_name: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  client_notes: string | null;
  due_date: string | null;
  decided_at: string | null;
  created_at: string;
}

export default function SelectionsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [items, setItems] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [optionName, setOptionName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("projects").select("id, name").eq("contractor_id", user.id);
      setProjects(data || []);
      if (data && data.length > 0) setSelectedProject(data[0].id);
      setLoading(false);
    })();
  }, [user]);

  const fetchItems = async (pid: string) => {
    const { data } = await supabase.from("project_selections").select("*").eq("project_id", pid).order("created_at", { ascending: false });
    setItems((data as Selection[]) || []);
  };

  useEffect(() => {
    if (selectedProject) fetchItems(selectedProject); else setItems([]);
  }, [selectedProject]);

  const reset = () => { setTitle(""); setOptionName(""); setDescription(""); setImageUrl(""); setDueDate(""); };

  const submit = async () => {
    if (!selectedProject || !title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("project_selections").insert({
      project_id: selectedProject,
      title: title.trim(),
      option_name: optionName.trim() || null,
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      due_date: dueDate || null,
    });
    setSaving(false);
    if (error) { toast.error("Failed to add selection"); return; }
    toast.success("Selection sent to client for approval");
    setOpen(false); reset();
    fetchItems(selectedProject);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("project_selections").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground">Selections & Approvals</h1>
          <p className="text-muted-foreground">Send materials, finishes, and design choices for client approval</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
              <Button disabled={!selectedProject} className="gap-2"><Plus className="w-4 h-4" /> New Selection</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Client Approval</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Kitchen backsplash tile" /></div>
                <div className="space-y-2"><Label>Option</Label><Input value={optionName} onChange={(e) => setOptionName(e.target.value)} placeholder="e.g., White subway 3x6" /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                <div className="space-y-2"><Label>Image URL (optional)</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></div>
                <div className="space-y-2"><Label>Due Date (optional)</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
                <Button className="w-full" onClick={submit} disabled={saving || !title.trim()}>{saving ? "Sending…" : "Send to Client"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">Create a project first.</CardContent></Card>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No selections yet for this project.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {items.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="grid md:grid-cols-[200px_1fr]">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} className="w-full h-48 md:h-full object-cover" />
                ) : (
                  <div className="w-full h-48 md:h-full bg-muted flex items-center justify-center"><ClipboardCheck className="w-10 h-10 text-muted-foreground" /></div>
                )}
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-display text-lg">{s.title}</h3>
                      {s.option_name && <p className="text-sm text-muted-foreground">{s.option_name}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "outline"} className="capitalize">
                        {s.status === "approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {s.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                        {s.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                        {s.status === "rejected" ? "Change Requested" : s.status}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                  {s.description && <p className="text-sm text-foreground/80">{s.description}</p>}
                  {s.due_date && <p className="text-xs text-muted-foreground">Decision needed by {format(new Date(s.due_date), "MMM d, yyyy")}</p>}
                  {s.client_notes && (
                    <div className="mt-2 p-3 rounded-md bg-muted text-sm">
                      <p className="text-xs text-muted-foreground mb-1">Client note{s.decided_at ? ` · ${format(new Date(s.decided_at), "MMM d")}` : ""}</p>
                      <p className="italic">"{s.client_notes}"</p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}