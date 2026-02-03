import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Upload,
  MoreVertical,
  FileText,
  Image,
  File,
  Folder,
  Download,
  Share2,
  Clock,
  Grid,
  List,
} from "lucide-react";

const recentFiles = [
  { id: 1, name: "Smith_FloorPlans_v3.pdf", type: "pdf", size: "2.4 MB", date: "Today", job: "Smith Residence" },
  { id: 2, name: "SitePhotos_Jan2024.zip", type: "archive", size: "15.2 MB", date: "Yesterday", job: "Oak Street Building" },
  { id: 3, name: "Electrical_Layout.dwg", type: "cad", size: "4.1 MB", date: "2 days ago", job: "Smith Residence" },
  { id: 4, name: "PermitApplication.pdf", type: "pdf", size: "892 KB", date: "3 days ago", job: "Downtown Office" },
  { id: 5, name: "RenderingFinal.png", type: "image", size: "8.7 MB", date: "1 week ago", job: "Riverside Apartments" },
  { id: 6, name: "Contract_GreenDev.pdf", type: "pdf", size: "1.2 MB", date: "1 week ago", job: "Riverside Apartments" },
];

const folders = [
  { id: 1, name: "Client Shared", count: 24, color: "bg-info" },
  { id: 2, name: "Internal Documents", count: 48, color: "bg-secondary" },
  { id: 3, name: "Contracts", count: 12, color: "bg-success" },
  { id: 4, name: "Templates", count: 8, color: "bg-warning" },
];

export default function DocumentsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-6 h-6 text-destructive" />;
      case "image":
        return <Image className="w-6 h-6 text-info" />;
      case "cad":
        return <File className="w-6 h-6 text-accent" />;
      default:
        return <File className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const filteredFiles = recentFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.job.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Documents"
        subtitle="Upload, organize, and share project files"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button variant="accent" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </div>

        {/* Folders */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="hover-lift cursor-pointer group"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${folder.color} flex items-center justify-center`}
                  >
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {folder.count} files
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <Tabs defaultValue="recent">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared with Me</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="recent" className="mt-0">
            {view === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="hover-lift group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h4 className="font-medium text-sm text-foreground truncate mb-1">
                        {file.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {file.job}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{file.size}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {file.date}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {file.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {file.job}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {file.size}
                        </div>
                        <div className="text-sm text-muted-foreground hidden md:flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {file.date}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shared" className="mt-0">
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No shared files yet
            </div>
          </TabsContent>

          <TabsContent value="starred" className="mt-0">
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No starred files yet
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
