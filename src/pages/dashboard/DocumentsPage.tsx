import { useState, useRef } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Upload,
  MoreVertical,
  FileText,
  Image,
  File,
  Folder,
  Download,
  Share2,
  Clock,
  Grid,
  List,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DocumentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProjectId, setUploadProjectId] = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploadShared, setUploadShared] = useState(false);

  // Fetch all project files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["project-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_files")
        .select("*, projects(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch projects for the upload dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile || !uploadProjectId || !user) throw new Error("Missing required fields");

      const fileExt = uploadFile.name.split(".").pop();
      const filePath = `${user.id}/${uploadProjectId}/${Date.now()}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from("project-files")
        .upload(filePath, uploadFile);
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from("project-files")
        .getPublicUrl(filePath);

      const fileType = uploadFile.type.startsWith("image/")
        ? "image"
        : uploadFile.type.includes("pdf")
        ? "document"
        : "document";

      const { error: dbError } = await supabase.from("project_files").insert({
        name: uploadFile.name,
        file_url: urlData.publicUrl,
        file_type: fileType,
        file_size: uploadFile.size,
        project_id: uploadProjectId,
        uploaded_by: user.id,
        category: uploadCategory,
        is_shared_with_client: uploadShared,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files"] });
      toast.success("File uploaded successfully");
      resetUploadForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_files").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files"] });
      toast.success("File deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Toggle share with client
  const toggleShareMutation = useMutation({
    mutationFn: async ({ id, shared }: { id: string; shared: boolean }) => {
      const { error } = await supabase
        .from("project_files")
        .update({ is_shared_with_client: shared })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files"] });
      toast.success("Sharing updated");
    },
  });

  const resetUploadForm = () => {
    setShowUploadDialog(false);
    setUploadFile(null);
    setUploadProjectId("");
    setUploadCategory("general");
    setUploadShared(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
      case "blueprint":
        return <Image className="w-6 h-6 text-info" />;
      case "document":
      case "contract":
        return <FileText className="w-6 h-6 text-destructive" />;
      default:
        return <File className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter(
    (file: any) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.projects?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group files by category for folder view
  const categories = [...new Set(files.map((f: any) => f.category || "general"))];
  const folderCounts = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: files.filter((f: any) => (f.category || "general") === cat).length,
  }));

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader title="Documents" subtitle="Upload, organize, and share project files" />
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Documents" subtitle="Upload, organize, and share project files" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")}>
              <Grid className="w-4 h-4" />
            </Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="accent" className="gap-2" onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </div>

        {/* Folders */}
        {folderCounts.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {folderCounts.map((folder) => (
                <Card key={folder.name} className="hover-lift cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Folder className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">{folder.count} files</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Documents Yet</h3>
              <p className="text-muted-foreground mb-4">Upload your first document to get started.</p>
              <Button variant="accent" className="gap-2" onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4" />
                Upload File
              </Button>
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map((file: any) => (
              <Card key={file.id} className="hover-lift group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      {getFileIcon(file.file_type)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleShareMutation.mutate({ id: file.id, shared: !file.is_shared_with_client })}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {file.is_shared_with_client ? "Unshare" : "Share with Client"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(file.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h4 className="font-medium text-sm text-foreground truncate mb-1">{file.name}</h4>
                  <p className="text-xs text-muted-foreground truncate mb-2">{file.projects?.name ?? "—"}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(file.file_size)}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(file.created_at), "MMM d")}
                    </div>
                  </div>
                  {file.is_shared_with_client && (
                    <Badge variant="outline" className="mt-2 text-xs">Shared</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredFiles.map((file: any) => (
                  <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">{file.projects?.name ?? "—"}</p>
                    </div>
                    {file.is_shared_with_client && <Badge variant="outline" className="text-xs">Shared</Badge>}
                    <div className="text-sm text-muted-foreground hidden sm:block">{formatFileSize(file.file_size)}</div>
                    <div className="text-sm text-muted-foreground hidden md:flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(file.created_at), "MMM d, yyyy")}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleShareMutation.mutate({ id: file.id, shared: !file.is_shared_with_client })}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {file.is_shared_with_client ? "Unshare" : "Share with Client"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(file.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Project</Label>
              <Select value={uploadProjectId} onValueChange={setUploadProjectId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="blueprint">Blueprint</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="share-client"
                checked={uploadShared}
                onCheckedChange={(v) => setUploadShared(!!v)}
              />
              <Label htmlFor="share-client">Share with client</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetUploadForm}>Cancel</Button>
            <Button
              variant="accent"
              onClick={() => uploadMutation.mutate()}
              disabled={!uploadFile || !uploadProjectId || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
