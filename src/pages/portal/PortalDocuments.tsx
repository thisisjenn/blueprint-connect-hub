import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Image, 
  FileSpreadsheet,
  Download,
  Eye,
  Folder
} from "lucide-react";
import { format } from "date-fns";

interface ProjectFile {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  category: string | null;
  created_at: string;
  projects: {
    name: string;
  } | null;
}

export default function PortalDocuments() {
  const { user } = useAuth();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchFiles() {
      const { data } = await supabase
        .from("project_files")
        .select(`
          *,
          projects (name)
        `)
        .eq("is_shared_with_client", true)
        .order("created_at", { ascending: false });

      setFiles((data as unknown as ProjectFile[]) || []);
      setIsLoading(false);
    }

    fetchFiles();
  }, [user]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
      case "blueprint":
        return <Image className="w-5 h-5" />;
      case "document":
      case "contract":
        return <FileText className="w-5 h-5" />;
      case "invoice":
        return <FileSpreadsheet className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground">Access files shared by your project team</p>
      </div>

      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground">
              Documents shared by your project team will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <Card key={file.id} className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{file.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{file.projects?.name}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>{format(new Date(file.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{file.file_type}</Badge>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a href={file.file_url} download>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
