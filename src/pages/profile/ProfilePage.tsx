
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, FileText, UserRound } from "lucide-react";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";

interface ProfileStats {
  transactionCount: number;
  createdAt: string | null;
  profileCreatedAt: Date | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    transactionCount: 0,
    createdAt: null,
    profileCreatedAt: null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);

        // Récupérer les statistiques du profil
        const { count: transactionCount } = await supabase
          .from("transactions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Récupérer la date de création du profil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", user.id)
          .single();

        setStats({
          transactionCount: transactionCount || 0,
          createdAt: user.created_at,
          profileCreatedAt: profileData?.created_at ? new Date(profileData.created_at) : null,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
        <h1 className="text-3xl font-bold">Profil Utilisateur</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
              <AvatarFallback className="text-2xl bg-gray-100 text-gray-700">
                {user?.email?.substring(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user?.email}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Button 
              variant="outline" 
              className="mt-2 w-full"
              onClick={() => navigate('/dashboard')}
            >
              Retour au Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserRound className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Identifiant</p>
                  <p className="text-sm font-mono break-all">{user?.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Compte créé</p>
                  <p className="text-sm">
                    {stats.createdAt ? (
                      <>
                        {new Date(stats.createdAt).toLocaleDateString('fr-FR')}
                        {' '}
                        <span className="text-gray-500">
                          ({formatDistance(new Date(stats.createdAt), new Date(), {
                            addSuffix: true,
                            locale: fr
                          })})
                        </span>
                      </>
                    ) : (
                      'Non disponible'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Transactions enregistrées</p>
                  <p className="text-sm">{stats.transactionCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Statistiques de l'activité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Transactions</p>
                <p className="text-2xl font-bold">{stats.transactionCount}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Dividendes</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Dernière connexion</p>
                <p className="text-sm">Aujourd'hui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
