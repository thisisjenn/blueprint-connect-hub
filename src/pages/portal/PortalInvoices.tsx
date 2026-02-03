import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, isPast } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  description: string | null;
  created_at: string;
  projects: {
    name: string;
  } | null;
}

export default function PortalInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchInvoices() {
      const { data } = await supabase
        .from("invoices")
        .select(`
          *,
          projects (name)
        `)
        .order("created_at", { ascending: false });

      setInvoices((data as unknown as Invoice[]) || []);
      setIsLoading(false);
    }

    fetchInvoices();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string, dueDate: string | null) => {
    const isOverdue = status === "pending" && dueDate && isPast(new Date(dueDate));
    const displayStatus = isOverdue ? "overdue" : status;
    
    switch (displayStatus) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingTotal = invoices
    .filter(i => i.status === "pending")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const paidTotal = invoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
        <p className="text-muted-foreground">View and manage your project invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">${pendingTotal.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold">${paidTotal.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Invoices Yet</h3>
            <p className="text-muted-foreground">
              Invoices for your projects will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    {getStatusIcon(invoice.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">Invoice #{invoice.invoice_number}</h3>
                      {getStatusBadge(invoice.status, invoice.due_date)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{invoice.projects?.name}</span>
                      {invoice.due_date && (
                        <>
                          <span>•</span>
                          <span>Due {format(new Date(invoice.due_date), "MMM d, yyyy")}</span>
                        </>
                      )}
                    </div>
                    {invoice.description && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">{invoice.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      ${Number(invoice.amount).toLocaleString()}
                    </p>
                    {invoice.status === "pending" && (
                      <Button variant="accent" size="sm" className="mt-2">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
