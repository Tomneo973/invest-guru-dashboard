
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, CreditCard, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, checkPremiumStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simuler un abonnement premium (sans vrai paiement)
  const handleSubscribe = async (planType: string, months: number, amount: number) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour vous abonner",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calculer la date de fin de l'abonnement
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);

      // Créer un enregistrement d'abonnement
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_type: planType,
          amount,
          currency: "EUR",
          end_date: endDate.toISOString(),
          payment_status: "completed" // Simulation d'un paiement réussi
        });

      if (subscriptionError) throw subscriptionError;

      // Mettre à jour le profil utilisateur
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "premium",
          premium_until: endDate.toISOString()
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Mettre à jour le statut premium dans le contexte
      await checkPremiumStatus();

      toast({
        title: "Félicitations !",
        description: `Vous êtes maintenant abonné au plan ${planType} jusqu'au ${endDate.toLocaleDateString()}`,
      });

      // Rediriger vers la page statistiques (première page premium)
      navigate("/statistics");
    } catch (error: any) {
      console.error("Erreur lors de la souscription:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la souscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Abonnement Premium</h1>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 m-2">
            <Badge className="bg-amber-500 hover:bg-amber-600">Recommandé</Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Abonnement Premium
            </CardTitle>
            <CardDescription>Accédez à toutes les fonctionnalités avancées</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">9,99€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Accès aux statistiques détaillées</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Analyses d'actions avancées</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Tableaux de bord personnalisés</span>
              </div>
              <div className="flex items-center">
                <X className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Engagement sur 12 mois</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe("premium_monthly", 1, 9.99)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              S'abonner maintenant
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abonnement Annuel</CardTitle>
            <CardDescription>Économisez avec un engagement annuel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold">99,99€</span>
              <span className="text-muted-foreground">/an</span>
              <div className="text-sm text-green-600 font-medium">Économisez 20%</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Toutes les fonctionnalités premium</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Priorité sur les nouvelles fonctionnalités</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={() => handleSubscribe("premium_yearly", 12, 99.99)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              S'abonner à l'année
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
