import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Project { id: string; name: string; }
interface ContractFile {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string;
  category: string;
  created_at: string;
}

export default function PortalContracts() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [files, setFiles] = useState<ContractFile[]>([]);
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
    if (!selectedProject) { setFiles([]); return; }
    (async () => {
      const { data } = await supabase
        .from("project_files")
        .select("id, name, description, file_url, file_type, category, created_at")
        .eq("project_id", selectedProject)
        .eq("is_shared_with_client", true)
        .in("category", ["contract", "agreement", "proposal"])
        .order("created_at", { ascending: false });
      setFiles((data as ContractFile[]) || []);
    })();
  }, [selectedProject]);

  const handleDownload = async (file: ContractFile) => {
    const { data, error } = await supabase.storage.from("project-files").createSignedUrl(file.file_url, 3600);
    if (error || !data) { toast.error("Failed to download contract"); return; }
    window.open(data.signedUrl, "_blank");
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground">Contracts & Agreements</h1>
          <p className="text-muted-foreground">Signed documents for your project</p>
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
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileSignature className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Contracts Yet</h3>
            <p className="text-muted-foreground">Your contractor hasn't shared any contracts for this project yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {files.map((f) => (
            <Card key={f.id} className="hover-lift">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{f.name}</h3>
                    <Badge variant="outline" className="capitalize">{f.category}</Badge>
                  </div>
                  {f.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{f.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Shared {format(new Date(f.created_at), "MMM d, yyyy")}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownload(f)} className="gap-2">
                  <Download className="w-4 h-4" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}