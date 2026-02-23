import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckSquare,
  MessageSquare,
  FolderOpen,
  Send,
  Loader2,
  Clock,
  AlertCircle,
  FileText,
  Image,
  Download,
  Eye,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_id: string | null;
  created_at: string;
  is_read: boolean;
  profiles: { full_name: string | null; email: string | null } | null;
}

interface ProjectFile {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  category: string | null;
  created_at: string;
}

export default function PortalProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all project data
  useEffect(() => {
    if (!user || !projectId) return;

    async function fetchAll() {
      const [projectRes, checklistRes, filesRes, messagesRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).eq("client_id", user.id).single(),
        supabase.from("client_checklist_items").select("*").eq("project_id", projectId).order("is_completed").order("due_date", { ascending: true }),
        supabase.from("project_files").select("*").eq("project_id", projectId).eq("is_shared_with_client", true).order("created_at", { ascending: false }),
        supabase.from("project_messages").select("*").eq("project_id", projectId).order("created_at", { ascending: true }),
      ]);

      setProject(projectRes.data as Project | null);
      setChecklist((checklistRes.data as unknown as ChecklistItem[]) || []);
      setFiles((filesRes.data as unknown as ProjectFile[]) || []);

      // Fetch profiles separately since there's no FK relationship
      const rawMessages = (messagesRes.data as any[]) || [];
      const senderIds = [...new Set(rawMessages.map((m) => m.sender_id).filter(Boolean))];
      let profilesMap: Record<string, { full_name: string | null; email: string | null }> = {};
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", senderIds);
        if (profiles) {
          profiles.forEach((p: any) => { profilesMap[p.user_id] = { full_name: p.full_name, email: p.email }; });
        }
      }
      const messagesWithProfiles = rawMessages.map((m) => ({
        ...m,
        profiles: profilesMap[m.sender_id] || null,
      }));
      setMessages(messagesWithProfiles as Message[]);
      setIsLoading(false);

      // Mark messages as read
      await supabase
        .from("project_messages")
        .update({ is_read: true })
        .eq("project_id", projectId)
        .eq("is_read", false)
        .neq("sender_id", user.id);
    }

    fetchAll();
  }, [user, projectId]);

  // Realtime messages
  useEffect(() => {
    if (!projectId || !user) return;

    const channel = supabase
      .channel(`project-msg-${projectId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "project_messages",
        filter: `project_id=eq.${projectId}`,
      }, async (payload) => {
        const newMsg = payload.new as any;
        let profiles = null;
        if (newMsg.sender_id) {
          const { data } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .eq("user_id", newMsg.sender_id)
            .maybeSingle();
          if (data) profiles = { full_name: data.full_name, email: data.email };
        }
        setMessages((prev) => [...prev, { ...newMsg, profiles } as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChecklist = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("client_checklist_items")
      .update({ is_completed: completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, is_completed: completed } : i)));
    toast.success(completed ? "Item completed!" : "Marked pending");
  };

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !projectId || !user) return;
    setIsSending(true);
    const { error } = await supabase.from("project_messages").insert({
      project_id: projectId,
      sender_id: user.id,
      content: trimmed,
    });
    if (error) toast.error("Failed to send message");
    else setNewMessage("");
    setIsSending(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "on_hold": return "outline";
      default: return "secondary";
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
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Project not found or you don't have access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingChecklist = checklist.filter((i) => !i.is_completed);
  const completedChecklist = checklist.filter((i) => i.is_completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
          </div>
          <Badge variant={getStatusColor(project.status) as any}>{project.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          {project.address && (
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{project.address}</span>
          )}
          {project.start_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(project.start_date), "MMM d, yyyy")}
              {project.end_date && ` — ${format(new Date(project.end_date), "MMM d, yyyy")}`}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="checklist" className="gap-2">
            <CheckSquare className="w-4 h-4" /> Checklist
            {pendingChecklist.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{pendingChecklist.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Messages
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FolderOpen className="w-4 h-4" /> Documents
            {files.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{files.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4 mt-4">
          {checklist.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No checklist items yet.</CardContent></Card>
          ) : (
            <>
              {pendingChecklist.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" /> Pending ({pendingChecklist.length})
                  </h3>
                  {pendingChecklist.map((item) => {
                    const isOverdue = item.due_date && isPast(new Date(item.due_date));
                    return (
                      <Card key={item.id} className={isOverdue ? "border-destructive/50" : ""}>
                        <CardContent className="p-4 flex items-start gap-4">
                          <Checkbox checked={false} onCheckedChange={(c) => toggleChecklist(item.id, c as boolean)} className="mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.title}</p>
                            {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                            {item.due_date && (
                              <div className={`flex items-center gap-1 text-sm mt-2 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                                <Clock className="w-3 h-3" /> Due {format(new Date(item.due_date), "MMM d, yyyy")}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              {completedChecklist.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" /> Completed ({completedChecklist.length})
                  </h3>
                  {completedChecklist.map((item) => (
                    <Card key={item.id} className="opacity-60">
                      <CardContent className="p-4 flex items-start gap-4">
                        <Checkbox checked onCheckedChange={(c) => toggleChecklist(item.id, c as boolean)} className="mt-1" />
                        <p className="font-medium text-foreground line-through">{item.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="mt-4">
          <Card className="flex flex-col h-[500px]">
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}>
                            {(msg.profiles?.full_name?.[0] || msg.profiles?.email?.[0] || "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                          <div className={`rounded-lg px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.profiles?.full_name || "Team Member"} • {format(new Date(msg.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  className="resize-none"
                  rows={2}
                />
                <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-3 mt-4">
          {files.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No shared documents yet.</CardContent></Card>
          ) : (
            files.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    {file.file_type === "image" ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.file_size)} • {format(new Date(file.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer"><Eye className="w-4 h-4" /></a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={file.file_url} download><Download className="w-4 h-4" /></a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
