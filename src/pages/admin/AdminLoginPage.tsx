
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Connexion avec Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        toast({
          title: "Erreur",
          description: "Utilisateur non trouvé.",
          variant: "destructive",
        });
        return;
      }

      // Vérifier si l'utilisateur est un administrateur
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', {
        user_id: data.user.id
      });

      if (adminCheckError) {
        throw adminCheckError;
      }

      if (!isAdmin) {
        // Déconnexion immédiate si ce n'est pas un administrateur
        await supabase.auth.signOut();
        
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administrateur nécessaires.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'espace administrateur.",
      });

      // Redirection vers la page d'administration
      navigate("/admin");
      
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-10 w-10 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Espace Administrateur</CardTitle>
          <CardDescription>
            Connectez-vous avec vos identifiants d'administrateur
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Se connecter</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
