import { useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MoreVertical,
  FileText,
  DollarSign,
  Send,
  Download,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const contracts = [
  {
    id: 1,
    name: "Smith Residence - Construction Agreement",
    client: "John Smith",
    status: "signed",
    value: "$45,000",
    date: "Jan 15, 2024",
    type: "contract",
  },
  {
    id: 2,
    name: "Oak Street Commercial - Scope of Work",
    client: "ABC Corp",
    status: "pending",
    value: "$120,000",
    date: "Jan 28, 2024",
    type: "proposal",
  },
  {
    id: 3,
    name: "Riverside Plans - Design Agreement",
    client: "Green Developers",
    status: "signed",
    value: "$8,500",
    date: "Dec 10, 2023",
    type: "contract",
  },
  {
    id: 4,
    name: "Downtown Office - Change Order #1",
    client: "Tech Solutions Inc",
    status: "draft",
    value: "$12,000",
    date: "Feb 1, 2024",
    type: "change_order",
  },
];

const invoices = [
  {
    id: 1,
    number: "INV-2024-001",
    client: "John Smith",
    amount: "$15,000",
    status: "paid",
    dueDate: "Jan 30, 2024",
  },
  {
    id: 2,
    number: "INV-2024-002",
    client: "ABC Corp",
    amount: "$40,000",
    status: "overdue",
    dueDate: "Jan 25, 2024",
  },
  {
    id: 3,
    number: "INV-2024-003",
    client: "Green Developers",
    amount: "$8,500",
    status: "paid",
    dueDate: "Jan 20, 2024",
  },
  {
    id: 4,
    number: "INV-2024-004",
    client: "Tech Solutions Inc",
    amount: "$22,500",
    status: "pending",
    dueDate: "Feb 15, 2024",
  },
];

const templates = [
  { id: 1, name: "Standard Construction Contract", uses: 24 },
  { id: 2, name: "Design Services Agreement", uses: 18 },
  { id: 3, name: "Change Order Form", uses: 32 },
  { id: 4, name: "Work Authorization", uses: 15 },
  { id: 5, name: "Proposal Template", uses: 41 },
];

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
      case "paid":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Contracts & Invoicing"
        subtitle="Manage contracts, invoices, and payment tracking"
      />

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="contracts" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="accent" className="gap-2">
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>
          </div>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {contract.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {contract.client}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="font-semibold text-foreground">
                          {contract.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contract.date}
                        </p>
                      </div>
                      <Badge
                        variant={
                          contract.status === "signed"
                            ? "completed"
                            : contract.status === "pending"
                            ? "pending"
                            : "draft"
                        }
                        className="gap-1"
                      >
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </Badge>
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
                            <Send className="w-4 h-4 mr-2" />
                            Send to Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
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
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-0">
            {/* Invoice Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">$23,500</p>
                      <p className="text-sm text-muted-foreground">Paid</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">$22,500</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">$40,000</p>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">
                          {invoice.number}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {invoice.client}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {invoice.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {invoice.dueDate}
                        </p>
                      </div>
                      <Badge
                        variant={
                          invoice.status === "paid"
                            ? "completed"
                            : invoice.status === "overdue"
                            ? "destructive"
                            : "pending"
                        }
                        className="gap-1"
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Invoice</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Void Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover-lift cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Use Template</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Used {template.uses} times
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add Template Card */}
              <Card className="hover-lift cursor-pointer border-dashed">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[160px]">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground">
                    Create Template
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
