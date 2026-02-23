import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  User,
  Inbox,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { AddJobDialog } from "@/components/jobs/AddJobDialog";

type ClientType = "all" | "homeowner" | "contractor" | "business";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ClientType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobClientId, setJobClientId] = useState<string | undefined>(undefined);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const [clientsRes, projectsRes] = await Promise.all([
        supabase.from("clients").select("*").order("name"),
        supabase.from("projects").select("id, status, client_record_id") as any,
      ]);
      if (clientsRes.error) throw clientsRes.error;
      return (clientsRes.data ?? []).map((client: any) => ({
        ...client,
        projects: (projectsRes.data ?? []).filter((p: any) => p.client_record_id === client.id),
      }));
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client archived");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filteredClients = clients.filter((client: any) => {
    const matchesFilter = filter === "all" || client.type === filter;
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "homeowner": return <User className="w-3 h-3" />;
      case "contractor": return <Briefcase className="w-3 h-3" />;
      case "business": return <Building2 className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getJobCounts = (client: any) => {
    const projects = client.projects ?? [];
    const active = projects.filter((p: any) => p.status === "active").length;
    return { active, total: projects.length };
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Clients" subtitle="Manage your clients and their contact information" />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ClientType)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="homeowner">Homeowners</TabsTrigger>
              <TabsTrigger value="contractor">Contractors</TabsTrigger>
              <TabsTrigger value="business">Businesses</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="accent" className="gap-2" onClick={() => { setEditClient(null); setShowAddClient(true); }}>
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Inbox className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No clients found</p>
            <p className="text-sm">Add your first client to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClients.map((client: any) => {
              const { active, total } = getJobCounts(client);
              return (
                <Card key={client.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          <Badge variant="outline" className="gap-1 mt-1">
                            {getTypeIcon(client.type)}
                            {client.type}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditClient(client); setShowAddClient(true); }}>
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setJobClientId(client.id);
                            setShowAddJob(true);
                          }}>
                            <Briefcase className="w-4 h-4 mr-2" />
                            Add Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const project = (client.projects ?? []).find((p: any) => p.status === "active");
                            if (project) {
                              window.location.href = `/dashboard/messages?project=${project.id}`;
                            } else {
                              toast.info("No active project found for this client. Add a project first.");
                            }
                          }}>
                            <Mail className="w-4 h-4 mr-2" />
                            Message Client
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteClient.mutate(client.id)}>
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 mb-4">
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{active}</p>
                        <p className="text-xs text-muted-foreground">Active Jobs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{total}</p>
                        <p className="text-xs text-muted-foreground">Total Jobs</p>
                      </div>
                      <Button variant="outline" size="sm">View Jobs</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddClientDialog
        open={showAddClient}
        onOpenChange={(open) => { setShowAddClient(open); if (!open) setEditClient(null); }}
        editClient={editClient}
      />

      <AddJobDialog
        open={showAddJob}
        onOpenChange={(open) => { setShowAddJob(open); if (!open) setJobClientId(undefined); }}
        preselectedClientId={jobClientId}
      />
    </div>
  );
}
