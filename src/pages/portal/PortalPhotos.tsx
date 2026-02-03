import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Trash2,
  Loader2,
  AlertTriangle,
  Lightbulb,
  FileText,
  MapPin
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface PhotoUpload {
  id: string;
  file_url: string;
  file_name: string;
  category: string;
  description: string | null;
  location_notes: string | null;
  created_at: string;
  projects: {
    name: string;
  } | null;
}

const categories = [
  { value: "site_progress", label: "Site Progress", icon: Camera, color: "bg-primary" },
  { value: "issue_report", label: "Issue Report", icon: AlertTriangle, color: "bg-destructive" },
  { value: "reference", label: "Reference/Inspiration", icon: Lightbulb, color: "bg-accent" },
  { value: "document_scan", label: "Document Scan", icon: FileText, color: "bg-info" },
];

export default function PortalPhotos() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [category, setCategory] = useState("site_progress");
  const [description, setDescription] = useState("");
  const [locationNotes, setLocationNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("client_id", user.id);

      setProjects(projectsData || []);
      if (projectsData && projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
      setIsLoading(false);
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!selectedProject) return;

    async function fetchPhotos() {
      const { data } = await supabase
        .from("client_photo_uploads")
        .select(`
          *,
          projects (name)
        `)
        .eq("project_id", selectedProject)
        .order("created_at", { ascending: false });

      setPhotos((data as unknown as PhotoUpload[]) || []);
    }

    fetchPhotos();
  }, [selectedProject]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProject || !user) return;

    setIsUploading(true);
    try {
      // Upload to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${selectedProject}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("client-uploads")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("client-uploads")
        .getPublicUrl(fileName);

      // Create database record
      const { error: dbError } = await supabase
        .from("client_photo_uploads")
        .insert({
          project_id: selectedProject,
          uploaded_by: user.id,
          file_url: urlData.publicUrl,
          file_name: selectedFile.name,
          category,
          description: description || null,
          location_notes: locationNotes || null,
        });

      if (dbError) throw dbError;

      toast.success("Photo uploaded successfully!");
      setUploadDialogOpen(false);
      resetUploadForm();
      
      // Refresh photos
      const { data } = await supabase
        .from("client_photo_uploads")
        .select(`*, projects (name)`)
        .eq("project_id", selectedProject)
        .order("created_at", { ascending: false });
      setPhotos((data as unknown as PhotoUpload[]) || []);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("client_photo_uploads")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete photo");
      return;
    }

    setPhotos(photos.filter(p => p.id !== id));
    toast.success("Photo deleted");
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCategory("site_progress");
    setDescription("");
    setLocationNotes("");
  };

  const getCategoryInfo = (value: string) => {
    return categories.find(c => c.value === value) || categories[0];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Photos</h1>
          <p className="text-muted-foreground">Share photos with your project team</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground">
              You'll be able to upload photos once a project is assigned to you.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Photos</h1>
          <p className="text-muted-foreground">Share photos with your project team</p>
        </div>
        <div className="flex items-center gap-3">
          {projects.length > 1 && (
            <Select value={selectedProject || ""} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
            setUploadDialogOpen(open);
            if (!open) resetUploadForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="accent" className="gap-2">
                <Camera className="w-4 h-4" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Photo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Photo Preview / Selection */}
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-2"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="w-6 h-6" />
                      <span>Take Photo</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-24 flex-col gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-6 h-6" />
                      <span>Choose File</span>
                    </Button>
                  </div>
                )}

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Add details about this photo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Location Notes */}
                <div className="space-y-2">
                  <Label>Location/Area (optional)</Label>
                  <Input
                    placeholder="e.g., Kitchen, Backyard, 2nd Floor"
                    value={locationNotes}
                    onChange={(e) => setLocationNotes(e.target.value)}
                  />
                </div>

                {/* Upload Button */}
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Photo"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload photos of site progress, issues, or references.
            </p>
            <Button variant="accent" onClick={() => setUploadDialogOpen(true)}>
              <Camera className="w-4 h-4 mr-2" />
              Upload Your First Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const catInfo = getCategoryInfo(photo.category);
            return (
              <Card key={photo.id} className="overflow-hidden hover-lift group">
                <div className="relative aspect-square">
                  <img
                    src={photo.file_url}
                    alt={photo.file_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => handleDelete(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className={`absolute top-2 left-2 ${catInfo.color} text-white`}>
                    <catInfo.icon className="w-3 h-3 mr-1" />
                    {catInfo.label}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  {photo.description && (
                    <p className="text-sm text-foreground line-clamp-2 mb-1">{photo.description}</p>
                  )}
                  {photo.location_notes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{photo.location_notes}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(photo.created_at), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
