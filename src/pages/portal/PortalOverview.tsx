import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  CheckSquare, 
  MessageSquare, 
  Receipt,
  Calendar,
  MapPin,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  address: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface Stats {
  documents: number;
  pendingTasks: number;
  unreadMessages: number;
  pendingInvoices: number;
}

export default function PortalOverview() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({ documents: 0, pendingTasks: 0, unreadMessages: 0, pendingInvoices: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", user.id);

      setProjects(projectsData || []);

      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);

        // Fetch stats in parallel
        const [filesRes, tasksRes, messagesRes, invoicesRes] = await Promise.all([
          supabase.from("project_files").select("id", { count: "exact" }).in("project_id", projectIds).eq("is_shared_with_client", true),
          supabase.from("client_checklist_items").select("id", { count: "exact" }).in("project_id", projectIds).eq("is_completed", false),
          supabase.from("project_messages").select("id", { count: "exact" }).in("project_id", projectIds).eq("is_read", false),
          supabase.from("invoices").select("id", { count: "exact" }).in("project_id", projectIds).eq("status", "pending"),
        ]);

        setStats({
          documents: filesRes.count || 0,
          pendingTasks: tasksRes.count || 0,
          unreadMessages: messagesRes.count || 0,
          pendingInvoices: invoicesRes.count || 0,
        });
      }

      setIsLoading(false);
    }

    fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "completed": return "default";
      case "on_hold": return "warning";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to Your Portal</h1>
        <p className="text-muted-foreground">Track your project progress and stay connected with your team</p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/portal/documents">
          <Card className="hover-lift cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.documents}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/portal/checklist">
          <Card className="hover-lift cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <CheckSquare className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                <p className="text-sm text-muted-foreground">Items Needed</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/portal/messages">
          <Card className="hover-lift cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-info/10">
                <MessageSquare className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/portal/invoices">
          <Card className="hover-lift cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Receipt className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                <p className="text-sm text-muted-foreground">Pending Invoices</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No projects assigned yet. Contact your contractor to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link key={project.id} to={`/portal/projects/${project.id}`}>
              <Card className="hover-lift cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {project.description && (
                        <CardDescription className="mt-1">{project.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant={getStatusColor(project.status) as any}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{project.address}</span>
                    </div>
                  )}
                  {project.start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Started {format(new Date(project.start_date), "MMM d, yyyy")}
                        {project.end_date && ` • Due ${format(new Date(project.end_date), "MMM d, yyyy")}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
