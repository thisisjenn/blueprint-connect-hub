import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  Filter,
  MoreVertical,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  FolderOpen,
  MapPin,
} from "lucide-react";

type JobStatus = "all" | "active" | "pending" | "completed";

const jobs = [
  {
    id: 1,
    name: "Smith Residence Renovation",
    client: "John Smith",
    clientEmail: "john.smith@email.com",
    status: "active",
    progress: 65,
    dueDate: "Feb 15, 2024",
    location: "123 Oak Street, Denver, CO",
    tasks: { completed: 8, total: 12 },
    team: ["JD", "AS", "MK"],
  },
  {
    id: 2,
    name: "Oak Street Commercial Building",
    client: "ABC Corp",
    clientEmail: "projects@abccorp.com",
    status: "pending",
    progress: 20,
    dueDate: "Mar 1, 2024",
    location: "456 Oak Street, Denver, CO",
    tasks: { completed: 2, total: 15 },
    team: ["JD", "RB"],
  },
  {
    id: 3,
    name: "Riverside Apartment Plans",
    client: "Green Developers",
    clientEmail: "info@greendev.com",
    status: "completed",
    progress: 100,
    dueDate: "Jan 28, 2024",
    location: "789 River Road, Boulder, CO",
    tasks: { completed: 10, total: 10 },
    team: ["AS", "MK"],
  },
  {
    id: 4,
    name: "Downtown Office Renovation",
    client: "Tech Solutions Inc",
    clientEmail: "facilities@techsolutions.com",
    status: "active",
    progress: 45,
    dueDate: "Feb 28, 2024",
    location: "321 Main Street, Denver, CO",
    tasks: { completed: 5, total: 11 },
    team: ["JD", "AS", "RB", "MK"],
  },
  {
    id: 5,
    name: "Mountain View House Plans",
    client: "Sarah Johnson",
    clientEmail: "sarah.j@email.com",
    status: "active",
    progress: 80,
    dueDate: "Feb 10, 2024",
    location: "555 Mountain View Dr, Aspen, CO",
    tasks: { completed: 12, total: 15 },
    team: ["MK"],
  },
];

const taskList = [
  { id: 1, title: "Review initial floor plans", completed: true, jobId: 1 },
  { id: 2, title: "Client meeting - design review", completed: true, jobId: 1 },
  { id: 3, title: "Update electrical layout", completed: false, jobId: 1 },
  { id: 4, title: "Submit to city for permits", completed: false, jobId: 1 },
  { id: 5, title: "Final walkthrough with client", completed: false, jobId: 1 },
];

export default function JobsPage() {
  const [filter, setFilter] = useState<JobStatus>("all");
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === "all" || job.status === filter;
    const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Jobs" 
        subtitle="Manage and track all your construction projects"
      />
      
      <div className="flex-1 overflow-hidden flex">
        {/* Jobs List */}
        <div className="w-full lg:w-[400px] border-r border-border flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as JobStatus)} className="flex-1">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">Done</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Jobs List */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  selectedJob.id === job.id
                    ? "bg-muted/50"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {job.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{job.client}</p>
                  </div>
                  <Badge
                    variant={
                      job.status === "active"
                        ? "active"
                        : job.status === "completed"
                        ? "completed"
                        : "pending"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {job.dueDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {job.tasks.completed}/{job.tasks.total}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={job.progress} className="h-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Add Job Button */}
          <div className="p-4 border-t border-border">
            <Button variant="accent" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              New Job
            </Button>
          </div>
        </div>

        {/* Job Details */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          {selectedJob && (
            <>
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-semibold text-foreground">
                        {selectedJob.name}
                      </h2>
                      <Badge
                        variant={
                          selectedJob.status === "active"
                            ? "active"
                            : selectedJob.status === "completed"
                            ? "completed"
                            : "pending"
                        }
                      >
                        {selectedJob.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedJob.client}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.location}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Job</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{selectedJob.progress}%</span>
                    </div>
                    <Progress value={selectedJob.progress} className="h-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">{selectedJob.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="tasks" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 border-b border-border">
                  <TabsList className="h-12 bg-transparent gap-4">
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-muted">
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="files" className="data-[state=active]:bg-muted">
                      Files
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-muted">
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-muted">
                      Activity
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="tasks" className="flex-1 overflow-auto p-6 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Task Checklist</h3>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {taskList.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox checked={task.completed} />
                        <span
                          className={`flex-1 text-sm ${
                            task.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                        <Button variant="ghost" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="files" className="flex-1 overflow-auto p-6 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Project Files</h3>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {["Floor Plans.pdf", "Electrical Layout.dwg", "Site Photos.zip", "Permit Application.pdf"].map((file) => (
                      <Card key={file} className="hover-lift cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file}</p>
                            <p className="text-xs text-muted-foreground">2.4 MB</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="flex-1 overflow-auto p-6 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Project Notes</h3>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Note
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Client prefers modern aesthetic with open floor plan. 
                        Budget is flexible for quality materials. 
                        Need to coordinate with existing landscaping contractor.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Added by John Doe · Jan 15, 2024
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="flex-1 overflow-auto p-6 mt-0">
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { action: "Task completed", detail: "Review initial floor plans", time: "2 hours ago" },
                      { action: "File uploaded", detail: "Floor Plans v2.pdf", time: "Yesterday" },
                      { action: "Comment added", detail: "Client approved the changes", time: "2 days ago" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.detail}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
