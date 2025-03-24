
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ 
  children,
  requireAuth = true,
  requirePremium = false
}: { 
  children: ReactNode,
  requireAuth?: boolean,
  requirePremium?: boolean
}) => {
  const { user, loading, isPremium } = useAuth();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  // Si authentification requise mais utilisateur non connecté
  if (requireAuth && !user) {
    return <Navigate to="/auth" />;
  }

  // Si statut premium requis mais utilisateur non premium
  if (requirePremium && !isPremium) {
    return <Navigate to="/subscription" />;
  }

  return <>{children}</>;
};
