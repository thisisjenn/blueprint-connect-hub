import { Bell, Briefcase, CheckSquare, Users, FileText, MessageSquare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; route?: string }> = {
  job: { icon: Briefcase, color: "text-blue-500", route: "/dashboard/jobs" },
  task: { icon: CheckSquare, color: "text-amber-500", route: "/dashboard/jobs" },
  client: { icon: Users, color: "text-green-500", route: "/dashboard/clients" },
  document: { icon: FileText, color: "text-purple-500", route: "/dashboard/documents" },
  message: { icon: MessageSquare, color: "text-primary", route: "/dashboard/messages" },
};

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (route: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.job;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    if (config.route) onNavigate(config.route);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-accent/50 rounded-lg",
        !notification.is_read && "bg-accent/30"
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-tight", !notification.is_read && "font-semibold text-foreground")}>
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.description}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.is_read && (
        <div className="flex-shrink-0 mt-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      )}
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              <Check className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            <div className="p-1">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
