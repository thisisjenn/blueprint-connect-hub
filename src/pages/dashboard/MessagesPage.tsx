import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import {
  Search,
  Send,
  CheckCheck,
  MessageSquarePlus,
  Users,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface Conversation {
  project_id: string;
  project_name: string;
  other_party_name: string;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  is_read: boolean;
  sender_name?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export default function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch projects the user is a member of (conversations)
  const { data: conversations = [], isLoading: loadingConvos } = useQuery({
    queryKey: ["message-conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get projects the user can access
      const { data: projects, error } = await supabase
        .from("projects")
        .select("id, name, client_id")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (!projects?.length) return [];

      // Fetch client names from profiles table using client_id (auth user_id)
      const clientUserIds = projects.map((p) => p.client_id).filter(Boolean) as string[];
      let clientMap: Record<string, string> = {};
      if (clientUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", clientUserIds);
        if (profiles) {
          clientMap = Object.fromEntries(profiles.map((p) => [p.user_id, p.full_name ?? "Unknown"]));
        }
      }

      // For each project, get last message and unread count
      const convos: Conversation[] = [];
      for (const proj of projects) {
        const { data: lastMsg } = await supabase
          .from("project_messages")
          .select("content, created_at")
          .eq("project_id", proj.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count: unreadCount } = await supabase
          .from("project_messages")
          .select("*", { count: "exact", head: true })
          .eq("project_id", proj.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        convos.push({
          project_id: proj.id,
          project_name: proj.name,
          other_party_name: proj.client_id ? (clientMap[proj.client_id] ?? "No client") : "No client",
          last_message: lastMsg?.content ?? null,
          last_message_time: lastMsg?.created_at ?? null,
          unread_count: unreadCount ?? 0,
        });
      }

      // Sort by last message time, projects with messages first
      convos.sort((a, b) => {
        if (!a.last_message_time && !b.last_message_time) return 0;
        if (!a.last_message_time) return 1;
        if (!b.last_message_time) return -1;
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });

      return convos;
    },
    enabled: !!user,
  });

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedProjectId && conversations.length > 0) {
      setSelectedProjectId(conversations[0].project_id);
    }
  }, [conversations, selectedProjectId]);

  // Fetch messages for selected project
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["project-messages", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const { data, error } = await supabase
        .from("project_messages")
        .select("id, content, created_at, sender_id, is_read")
        .eq("project_id", selectedProjectId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set((data ?? []).map((m) => m.sender_id).filter(Boolean))];
      let profileMap: Record<string, string> = {};
      if (senderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", senderIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p.full_name ?? "Unknown"]));
        }
      }

      return (data ?? []).map((m) => ({
        ...m,
        sender_name: profileMap[m.sender_id ?? ""] ?? "Unknown",
      })) as Message[];
    },
    enabled: !!selectedProjectId,
  });

  // Mark messages as read when viewing
  useEffect(() => {
    if (!selectedProjectId || !user) return;
    supabase
      .from("project_messages")
      .update({ is_read: true })
      .eq("project_id", selectedProjectId)
      .neq("sender_id", user.id)
      .eq("is_read", false)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["message-conversations"] });
      });
  }, [selectedProjectId, user, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!selectedProjectId) return;
    const channel = supabase
      .channel(`messages-${selectedProjectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${selectedProjectId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["project-messages", selectedProjectId] });
          queryClient.invalidateQueries({ queryKey: ["message-conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProjectId, queryClient]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedProjectId || !user) throw new Error("No project selected");
      const { error } = await supabase.from("project_messages").insert({
        project_id: selectedProjectId,
        sender_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["project-messages", selectedProjectId] });
      queryClient.invalidateQueries({ queryKey: ["message-conversations"] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  const handleSend = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendMessage.mutate(trimmed);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.other_party_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConvo = conversations.find((c) => c.project_id === selectedProjectId);

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Messages"
        subtitle="Communicate with clients and team members"
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loadingConvos ? (
              <div className="space-y-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Users className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No matching conversations" : "No projects yet. Create a job to start messaging."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.project_id}
                  onClick={() => setSelectedProjectId(conv.project_id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border ${
                    selectedProjectId === conv.project_id
                      ? "bg-muted/50"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(conv.other_party_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {conv.other_party_name}
                      </h4>
                      {conv.last_message_time && (
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">
                          {formatMessageTime(conv.last_message_time)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.project_name}
                    </p>
                    {conv.last_message && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {conv.last_message}
                      </p>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <Badge className="bg-accent text-accent-foreground h-5 w-5 p-0 flex items-center justify-center text-xs shrink-0">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(selectedConvo.other_party_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedConvo.other_party_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedConvo.project_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        <Skeleton className="h-14 w-[60%] rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquarePlus className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMe = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            } rounded-2xl px-4 py-2`}
                          >
                            {!isMe && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {message.sender_name}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span
                                className={`text-xs ${
                                  isMe
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {format(new Date(message.created_at), "h:mm a")}
                              </span>
                              {isMe && (
                                <CheckCheck
                                  className={`w-3 h-3 ${
                                    message.is_read
                                      ? "text-accent"
                                      : "text-primary-foreground/70"
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sendMessage.isPending}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquarePlus className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a project from the left to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
