import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Star,
  Archive,
  CheckCheck,
} from "lucide-react";

const conversations = [
  {
    id: 1,
    name: "John Smith",
    lastMessage: "Thanks for the updated floor plans!",
    time: "2 min ago",
    unread: 2,
    online: true,
    avatar: "",
  },
  {
    id: 2,
    name: "ABC Corp - Sarah",
    lastMessage: "When can we schedule the site visit?",
    time: "1 hour ago",
    unread: 0,
    online: false,
    avatar: "",
  },
  {
    id: 3,
    name: "Green Developers",
    lastMessage: "The permits have been approved!",
    time: "3 hours ago",
    unread: 1,
    online: true,
    avatar: "",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    lastMessage: "I love the new design concepts",
    time: "Yesterday",
    unread: 0,
    online: false,
    avatar: "",
  },
  {
    id: 5,
    name: "Tech Solutions Inc",
    lastMessage: "Please send the invoice for phase 2",
    time: "2 days ago",
    unread: 0,
    online: false,
    avatar: "",
  },
];

const messages = [
  {
    id: 1,
    sender: "John Smith",
    content: "Hi, I was wondering about the progress on the floor plans?",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    content: "Hi John! The floor plans are almost ready. I'm just finishing up the electrical layout.",
    time: "10:35 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "John Smith",
    content: "That's great! Can you also include the placement for the solar panels we discussed?",
    time: "10:37 AM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Me",
    content: "Absolutely! I'll add that to the roof plan as well. Should have everything ready by end of day.",
    time: "10:40 AM",
    isMe: true,
  },
  {
    id: 5,
    sender: "John Smith",
    content: "Perfect! Looking forward to seeing it. Thanks for the quick turnaround!",
    time: "10:42 AM",
    isMe: false,
  },
  {
    id: 6,
    sender: "Me",
    content: "Here are the updated floor plans with all the changes we discussed.",
    time: "4:15 PM",
    isMe: true,
    attachment: "FloorPlans_v3.pdf",
  },
  {
    id: 7,
    sender: "John Smith",
    content: "Thanks for the updated floor plans!",
    time: "4:20 PM",
    isMe: false,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border ${
                  selectedConversation.id === conv.id
                    ? "bg-muted/50"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.avatar} alt={conv.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(conv.name)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {conv.name}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <Badge className="bg-accent text-accent-foreground h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {conv.unread}
                  </Badge>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={selectedConversation.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(selectedConversation.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">
                  {selectedConversation.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Star className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } rounded-2xl px-4 py-2`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.attachment && (
                      <div className="mt-2 p-2 bg-background/10 rounded-lg flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-xs">{message.attachment}</span>
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        message.isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          message.isMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </span>
                      {message.isMe && (
                        <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // Handle send
                  }
                }}
              />
              <Button variant="accent" size="icon">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
