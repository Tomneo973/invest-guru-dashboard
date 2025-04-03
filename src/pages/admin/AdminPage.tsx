
import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import UserManagement from "./components/UserManagement";
import TransactionManagement from "./components/TransactionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminActions } from "./hooks/useAdminActions";

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('user');
  const defaultTab = userIdParam ? "users" : "transactions";
  const { checkAdminStatus } = useAdminActions();

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        setIsLoading(true);
        const isUserAdmin = await checkAdminStatus();
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les droits d'administrateur nécessaires.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erreur:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminStatus();
  }, [checkAdminStatus, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Panneau d'administration</h1>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Consultez et gérez les comptes utilisateurs de la plateforme. Recherchez par ID, email ou pays.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des transactions</CardTitle>
              <CardDescription>
                Consultez et filtrez toutes les transactions des utilisateurs. Accédez aux détails complets et aux profils des utilisateurs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
