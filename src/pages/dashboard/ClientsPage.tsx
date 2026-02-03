import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ClientType = "all" | "homeowner" | "contractor" | "business";

const clients = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    address: "123 Oak Street, Denver, CO 80202",
    type: "homeowner",
    activeJobs: 2,
    totalJobs: 5,
    avatar: "",
  },
  {
    id: 2,
    name: "ABC Corp",
    email: "projects@abccorp.com",
    phone: "(555) 234-5678",
    address: "456 Business Ave, Denver, CO 80203",
    type: "business",
    activeJobs: 1,
    totalJobs: 3,
    avatar: "",
  },
  {
    id: 3,
    name: "Green Developers",
    email: "info@greendev.com",
    phone: "(555) 345-6789",
    address: "789 Development Blvd, Boulder, CO 80301",
    type: "contractor",
    activeJobs: 3,
    totalJobs: 8,
    avatar: "",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 456-7890",
    address: "555 Mountain View Dr, Aspen, CO 81611",
    type: "homeowner",
    activeJobs: 1,
    totalJobs: 1,
    avatar: "",
  },
  {
    id: 5,
    name: "Tech Solutions Inc",
    email: "facilities@techsolutions.com",
    phone: "(555) 567-8901",
    address: "321 Main Street, Denver, CO 80204",
    type: "business",
    activeJobs: 1,
    totalJobs: 2,
    avatar: "",
  },
  {
    id: 6,
    name: "Mike's Construction",
    email: "mike@mikesconstruction.com",
    phone: "(555) 678-9012",
    address: "888 Builder Lane, Aurora, CO 80010",
    type: "contractor",
    activeJobs: 0,
    totalJobs: 4,
    avatar: "",
  },
];

export default function ClientsPage() {
  const [filter, setFilter] = useState<ClientType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter((client) => {
    const matchesFilter = filter === "all" || client.type === filter;
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "homeowner":
        return <User className="w-3 h-3" />;
      case "contractor":
        return <Briefcase className="w-3 h-3" />;
      case "business":
        return <Building2 className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

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
        title="Clients"
        subtitle="Manage your clients and their contact information"
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as ClientType)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="homeowner">Homeowners</TabsTrigger>
              <TabsTrigger value="contractor">Contractors</TabsTrigger>
              <TabsTrigger value="business">Businesses</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="accent" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Clients Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {client.name}
                      </h3>
                      <Badge variant="outline" className="gap-1 mt-1">
                        {getTypeIcon(client.type)}
                        {client.type}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit Client</DropdownMenuItem>
                      <DropdownMenuItem>Send Message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {client.activeJobs}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {client.totalJobs}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Jobs</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
