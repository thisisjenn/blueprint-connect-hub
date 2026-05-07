import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDocumentDialog({ open, onOpenChange }: UploadDocumentDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState("general");
  const [shared, setShared] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const resetForm = () => {
    setUploadFile(null);
    setProjectId("");
    setCategory("general");
    setShared(false);
    onOpenChange(false);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile || !projectId || !user) throw new Error("Missing required fields");

      const fileExt = uploadFile.name.split(".").pop();
      const filePath = `${user.id}/${projectId}/${Date.now()}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from("project-files")
        .upload(filePath, uploadFile);
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(filePath);

      const fileType = uploadFile.type.startsWith("image/") ? "image" : "document";

      const { error: dbError } = await supabase.from("project_files").insert({
        name: uploadFile.name,
        file_url: urlData.publicUrl,
        file_type: fileType,
        file_size: uploadFile.size,
        project_id: projectId,
        uploaded_by: user.id,
        category,
        is_shared_with_client: shared,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-files"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-files-count"] });
      toast.success("File uploaded successfully");
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>File *</Label>
            <Input ref={fileInputRef} type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Checkbox id="share-upload" checked={shared} onCheckedChange={(v) => setShared(!!v)} />
            <Label htmlFor="share-upload">Share with client</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!uploadFile || !projectId || mutation.isPending}>
            {mutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
