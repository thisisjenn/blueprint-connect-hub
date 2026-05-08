import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, ClipboardCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Project { id: string; name: string; }
interface Selection {
  id: string;
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

export default function PortalSelections() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [items, setItems] = useState<Selection[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
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

  const fetchItems = async (projectId: string) => {
    const { data } = await supabase
      .from("project_selections")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    setItems((data as Selection[]) || []);
  };

  useEffect(() => {
    if (!selectedProject) { setItems([]); return; }
    fetchItems(selectedProject);
  }, [selectedProject]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("project_selections")
      .update({ status, client_notes: notes[id] ?? null, decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error("Failed to update selection"); return; }
    toast.success(status === "approved" ? "Selection approved" : "Change requested");
    if (selectedProject) fetchItems(selectedProject);
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground">Approvals & Selections</h1>
          <p className="text-muted-foreground">Review and approve materials, finishes, and design choices</p>
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
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nothing to approve</h3>
            <p className="text-muted-foreground">Selections will appear here when your contractor needs your input.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((s) => {
            const pending = s.status === "pending";
            return (
              <Card key={s.id} className="overflow-hidden">
                <div className="grid md:grid-cols-[200px_1fr]">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} className="w-full h-48 md:h-full object-cover" />
                  ) : (
                    <div className="w-full h-48 md:h-full bg-muted flex items-center justify-center">
                      <ClipboardCheck className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-display text-lg">{s.title}</h3>
                        {s.option_name && <p className="text-sm text-muted-foreground">{s.option_name}</p>}
                      </div>
                      <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "outline"} className="capitalize">
                        {s.status === "approved" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {s.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                        {s.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                        {s.status === "rejected" ? "Change Requested" : s.status}
                      </Badge>
                    </div>
                    {s.description && <p className="text-sm text-foreground/80">{s.description}</p>}
                    {s.due_date && <p className="text-xs text-muted-foreground">Decision needed by {format(new Date(s.due_date), "MMM d, yyyy")}</p>}
                    {pending ? (
                      <>
                        <Textarea
                          placeholder="Add a note (optional)…"
                          value={notes[s.id] ?? ""}
                          onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => decide(s.id, "approved")} className="gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => decide(s.id, "rejected")} className="gap-2">
                            <XCircle className="w-4 h-4" /> Request Change
                          </Button>
                        </div>
                      </>
                    ) : (
                      s.client_notes && <p className="text-sm text-muted-foreground italic">"{s.client_notes}"</p>
                    )}
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}