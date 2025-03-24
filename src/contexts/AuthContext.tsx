
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  role: "user" | "premium" | "admin";
  premiumUntil: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  checkPremiumStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isPremium: false,
  isAdmin: false,
  checkPremiumStatus: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, premium_until")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const checkPremiumStatus = async (): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const profile = await fetchUserProfile(userData.user.id);
      if (!profile) return false;

      const isPremium = 
        profile.role === "premium" || 
        profile.role === "admin" || 
        (profile.premium_until && new Date(profile.premium_until) > new Date());

      return isPremium;
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Vérifier si l'utilisateur est déjà connecté
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          const profile = await fetchUserProfile(sessionData.session.user.id);
          
          // Déterminer si l'utilisateur est premium et/ou admin
          const isPremium = 
            profile?.role === "premium" || 
            profile?.role === "admin" || 
            (profile?.premium_until && new Date(profile.premium_until) > new Date());
          
          const isAdmin = profile?.role === "admin";

          setUser({
            id: sessionData.session.user.id,
            email: sessionData.session.user.email || "",
            isPremium,
            isAdmin,
            role: profile?.role || "user",
            premiumUntil: profile?.premium_until || null
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast({
          title: "Erreur d'authentification",
          description: "Impossible de récupérer les informations utilisateur",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        
        const isPremium = 
          profile?.role === "premium" || 
          profile?.role === "admin" || 
          (profile?.premium_until && new Date(profile.premium_until) > new Date());
        
        const isAdmin = profile?.role === "admin";

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          isPremium,
          isAdmin,
          role: profile?.role || "user",
          premiumUntil: profile?.premium_until || null
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isPremium: user?.isPremium || false,
      isAdmin: user?.isAdmin || false,
      checkPremiumStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
