import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature, Download, Eye, PenLine } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type ContractStatus = "Pending Signature" | "Signed" | "Expired";

interface Contract {
  id: string;
  name: string;
  issuedAt: Date;
  status: ContractStatus;
}

const INITIAL: Contract[] = [
  { id: "1", name: "Master Services Agreement", issuedAt: new Date(Date.now() - 86400000 * 14), status: "Signed" },
  { id: "2", name: "Kitchen Remodel — Change Order #1", issuedAt: new Date(Date.now() - 86400000 * 3), status: "Pending Signature" },
  { id: "3", name: "Bathroom Addendum", issuedAt: new Date(Date.now() - 86400000 * 60), status: "Expired" },
  { id: "4", name: "Payment Schedule", issuedAt: new Date(Date.now() - 86400000 * 1), status: "Pending Signature" },
];

const statusVariant: Record<ContractStatus, "default" | "secondary" | "destructive"> = {
  Signed: "default",
  "Pending Signature": "secondary",
  Expired: "destructive",
};

export default function PortalContracts() {
  const [contracts, setContracts] = useState<Contract[]>(INITIAL);

  const handleSign = (id: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Signed" as ContractStatus } : c))
    );
    toast.success("Contract signed (placeholder)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
        <p className="text-muted-foreground">Review and sign contracts shared with you</p>
      </div>

      <div className="space-y-3">
        {contracts.map((c) => (
          <Card key={c.id} className="hover-lift">
            <CardContent className="p-4 flex flex-wrap items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <FileSignature className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-medium text-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Issued {format(c.issuedAt, "MMM d, yyyy")}
                </p>
              </div>
              <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" onClick={() => toast.info("Preview coming soon")}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => toast.info("Download coming soon")}>
                  <Download className="w-4 h-4" />
                </Button>
                {c.status === "Pending Signature" && (
                  <Button variant="accent" size="sm" className="gap-2" onClick={() => handleSign(c.id)}>
                    <PenLine className="w-4 h-4" />
                    Sign
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}