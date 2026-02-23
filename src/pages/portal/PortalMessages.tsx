import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string | null;
  created_at: string;
  is_read: boolean;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default function PortalMessages() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchProjects() {
      const { data } = await supabase
        .from("projects")
        .select("id, name")
        .eq("client_id", user.id);

      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
      setIsLoading(false);
    }

    fetchProjects();
  }, [user]);

  useEffect(() => {
    if (!selectedProject) return;

    async function fetchMessages() {
      const { data } = await supabase
        .from("project_messages")
        .select("*")
        .eq("project_id", selectedProject)
        .order("created_at", { ascending: true });

      const rawMessages = data || [];

      // Fetch sender profiles separately since there's no FK
      const senderIds = [...new Set(rawMessages.map((m) => m.sender_id).filter(Boolean))];
      let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", senderIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, { full_name: p.full_name, email: p.email }]));
        }
      }

      const messagesWithProfiles: Message[] = rawMessages.map((m) => ({
        id: m.id,
        content: m.content,
        sender_id: m.sender_id,
        created_at: m.created_at ?? "",
        is_read: m.is_read ?? false,
        profiles: profileMap[m.sender_id ?? ""] ?? null,
      }));

      setMessages(messagesWithProfiles);

      // Mark messages as read
      await supabase
        .from("project_messages")
        .update({ is_read: true })
        .eq("project_id", selectedProject)
        .eq("is_read", false)
        .neq("sender_id", user?.id);
    }

    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`messages-${selectedProject}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${selectedProject}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Fetch profile for the sender
          let profiles = null;
          if (newMsg.sender_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("user_id", newMsg.sender_id)
              .maybeSingle();
            profiles = profileData;
          }

          const message: Message = {
            id: newMsg.id,
            content: newMsg.content,
            sender_id: newMsg.sender_id,
            created_at: newMsg.created_at ?? "",
            is_read: newMsg.is_read ?? false,
            profiles,
          };

          setMessages((prev) => [...prev, message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProject, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const MAX_MESSAGE_LENGTH = 10000;

  const sendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !selectedProject || !user) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message must be ${MAX_MESSAGE_LENGTH.toLocaleString()} characters or less`);
      return;
    }

    setIsSending(true);
    const { error } = await supabase
      .from("project_messages")
      .insert({
        project_id: selectedProject,
        sender_id: user.id,
        content: trimmed,
      });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Communicate with your project team</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground">
              You'll be able to message your team once a project is assigned to you.
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
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Communicate with your project team</p>
        </div>
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
      </div>

      <Card className="h-[calc(100vh-250px)] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">
            {projects.find(p => p.id === selectedProject)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}>
                        {(message.profiles?.full_name?.[0] || message.profiles?.email?.[0] || "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.profiles?.full_name || "Team Member"} • {format(new Date(message.created_at), "MMM d, h:mm a")}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              maxLength={MAX_MESSAGE_LENGTH}
              className="resize-none"
              rows={2}
            />
            <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
