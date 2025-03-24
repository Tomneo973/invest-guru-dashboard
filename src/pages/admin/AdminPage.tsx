
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUsers } from "./hooks/useUsers";
import { StatisticsCards } from "./components/StatisticsCards";
import { UserManagementTable } from "./components/UserManagementTable";

export default function AdminPage() {
  const { users, loading, userCount, premiumCount, handleTogglePremium } = useUsers();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas admin
    if (!isAdmin) {
      navigate("/dashboard");
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administration",
        variant: "destructive",
      });
    }
  }, [isAdmin, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration</h1>
      </div>

      <StatisticsCards userCount={userCount} premiumCount={premiumCount} />

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementTable 
            users={users} 
            onTogglePremium={handleTogglePremium} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
