import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HardHat, Loader2, User, Briefcase } from "lucide-react";
import { toast } from "sonner";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  client: <User className="w-6 h-6" />,
  contractor: <Briefcase className="w-6 h-6" />,
};

const ROLE_LABELS: Record<string, { label: string; description: string }> = {
  client: { label: "Homeowner", description: "Access your project portal" },
  contractor: { label: "Contractor", description: "Manage projects & clients" },
};

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRoles() {
      const { data, error } = await supabase.rpc("get_available_roles");
      if (!error && data && data.length > 0) {
        setAvailableRoles(data as string[]);
        setRole(data[0] as string);
      }
      setRolesLoading(false);
    }
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password, fullName, role as "client" | "contractor");

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Account created! Please check your email to verify your account.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <HardHat className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground">BlueprintHub</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Get started with BlueprintHub today
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-3">
                <Label>I am a...</Label>
                {rolesLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-24 rounded-lg border-2 border-border animate-pulse bg-muted" />
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    value={role}
                    onValueChange={setRole}
                    className={`grid gap-4`}
                    style={{ gridTemplateColumns: `repeat(${Math.min(availableRoles.length, 2)}, 1fr)` }}
                  >
                    {availableRoles.map((r) => {
                      const info = ROLE_LABELS[r] ?? { label: r.charAt(0).toUpperCase() + r.slice(1), description: "" };
                      return (
                        <Label
                          key={r}
                          htmlFor={`role-${r}`}
                          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                            role === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={r} id={`role-${r}`} className="sr-only" />
                          {ROLE_ICONS[r] ?? <User className="w-6 h-6" />}
                          <span className="font-medium">{info.label}</span>
                          {info.description && (
                            <span className="text-xs text-muted-foreground text-center">{info.description}</span>
                          )}
                        </Label>
                      );
                    })}
                  </RadioGroup>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
