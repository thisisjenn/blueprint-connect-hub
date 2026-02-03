import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  projects: {
    name: string;
  } | null;
}

export default function PortalChecklist() {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchItems() {
      const { data } = await supabase
        .from("client_checklist_items")
        .select(`
          *,
          projects (name)
        `)
        .order("is_completed", { ascending: true })
        .order("due_date", { ascending: true });

      setItems((data as unknown as ChecklistItem[]) || []);
      setIsLoading(false);
    }

    fetchItems();
  }, [user]);

  const toggleItem = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("client_checklist_items")
      .update({ 
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update item");
      return;
    }

    setItems(items.map(item => 
      item.id === id ? { ...item, is_completed: completed } : item
    ));

    toast.success(completed ? "Item completed!" : "Item marked as pending");
  };

  const pendingItems = items.filter(i => !i.is_completed);
  const completedItems = items.filter(i => i.is_completed);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your Checklist</h1>
        <p className="text-muted-foreground">Items we need from you to complete your project</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No pending items at the moment. We'll add items here when we need something from you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Pending Items ({pendingItems.length})
              </h2>
              <div className="space-y-3">
                {pendingItems.map((item) => {
                  const isOverdue = item.due_date && isPast(new Date(item.due_date));
                  
                  return (
                    <Card key={item.id} className={`hover-lift ${isOverdue ? "border-destructive/50" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={item.is_completed}
                            onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{item.title}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline">{item.projects?.name}</Badge>
                              {item.due_date && (
                                <div className={`flex items-center gap-1 text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                                  <Clock className="w-3 h-3" />
                                  <span>Due {format(new Date(item.due_date), "MMM d, yyyy")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-success" />
                Completed ({completedItems.length})
              </h2>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <Card key={item.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={item.is_completed}
                          onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground line-through">{item.title}</h3>
                          <Badge variant="outline" className="mt-2">{item.projects?.name}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
