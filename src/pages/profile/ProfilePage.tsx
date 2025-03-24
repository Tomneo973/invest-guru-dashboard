import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, FileText, UserRound, Mail, Lock, Upload, Globe, CakeIcon, Star, CheckCircle } from "lucide-react";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

interface ProfileStats {
  transactionCount: number;
  dividendCount: number;
  createdAt: string | null;
  profileCreatedAt: Date | null;
}

interface UserProfile {
  email: string;
  birthday?: string;
  country?: string;
  avatar_url?: string;
  role?: string;
  premium_until?: string;
}

interface ProfileUpdates {
  id: string;
  birthday: string;
  country: string;
  updated_at: string;
  avatar_url?: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser, isPremium } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    transactionCount: 0,
    dividendCount: 0,
    createdAt: null,
    profileCreatedAt: null,
  });
  
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);
        setNewEmail(user.email || "");

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("created_at, birthday, country, avatar_url, role, premium_until")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setBirthday(profileData.birthday || "");
          setCountry(profileData.country || "");
          setAvatarUrl(profileData.avatar_url || null);
          
          setProfile({
            email: user.email || "",
            birthday: profileData.birthday || "",
            country: profileData.country || "",
            avatar_url: profileData.avatar_url || "",
          });

          const profileCreatedDate = profileData.created_at ? new Date(profileData.created_at) : null;
          setStats(prev => ({
            ...prev,
            profileCreatedAt: profileCreatedDate
          }));
        }

        const { count: transactionCount } = await supabase
          .from("transactions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        const { count: dividendCount } = await supabase
          .from("dividends")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        setStats({
          transactionCount: transactionCount || 0,
          dividendCount: dividendCount || 0,
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const updateUserProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const updates: ProfileUpdates = {
        id: user.id,
        birthday,
        country,
        updated_at: new Date().toISOString(),
      };
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        updates.avatar_url = publicUrl;
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updates);
        
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
      });
      
      setProfile(prev => ({
        ...prev!,
        birthday,
        country,
        avatar_url: updates.avatar_url || prev?.avatar_url || "",
      }));
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du profil: " + error.message,
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const updateEmail = async () => {
    if (!user || !newEmail) return;
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (error) throw error;
      
      toast({
        title: "Email mis à jour",
        description: "Un email de confirmation a été envoyé à votre nouvelle adresse",
      });
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de l'email: " + error.message,
        variant: "destructive",
      });
    }
  };
  
  const updatePassword = async () => {
    if (!user || !newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      });
      
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du mot de passe: " + error.message,
        variant: "destructive",
      });
    }
  };

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
              <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url || ""} />
              <AvatarFallback className="text-2xl bg-gray-100 text-gray-700">
                {user?.email?.substring(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user?.email}</CardTitle>
            
            <div className="mt-2">
              {isPremium ? (
                <Badge className="bg-amber-500">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge variant="outline">Compte Standard</Badge>
              )}
            </div>
            
            <div className="w-full mt-4">
              <Label htmlFor="avatar" className="block text-sm mb-2">Changer la photo de profil</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="flex-1"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            {!isPremium && (
              <Button 
                className="w-full mt-2"
                onClick={() => navigate('/subscription')}
              >
                <Star className="w-4 h-4 mr-2" />
                Passer Premium
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full"
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
            <CardTitle>Paramètres du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium">Modifier l'email</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Nouvel email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={newEmail} 
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={updateEmail}>Mettre à jour</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium">Modifier le mot de passe</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor="password">Nouveau mot de passe</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button onClick={updatePassword}>Mettre à jour</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CakeIcon className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium">Date de naissance</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label htmlFor="birthday">Date de naissance</Label>
                      <Input 
                        id="birthday" 
                        type="date" 
                        value={birthday} 
                        onChange={(e) => setBirthday(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium">Pays</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label htmlFor="country">Pays (devise par défaut)</Label>
                      <Input 
                        id="country" 
                        type="text" 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="France (EUR), USA (USD), etc."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={updateUserProfile} 
                    disabled={isUpdating}
                    className="w-full md:w-auto"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
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
                <p className="text-2xl font-bold">{stats.dividendCount}</p>
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
