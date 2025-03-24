
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserX, Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfile {
  id: string;
  email: string;
  role: "user" | "premium" | "admin";
  premium_until: string | null;
  created_at: string;
}

interface UserManagementTableProps {
  users: UserProfile[];
  onTogglePremium: (userId: string, currentRole: string, currentPremiumUntil: string | null) => Promise<void>;
}

export function UserManagementTable({ users, onTogglePremium }: UserManagementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date d'inscription</TableHead>
          <TableHead>Expiration Premium</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
              {user.role === "admin" ? (
                <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>
              ) : user.role === "premium" || (user.premium_until && new Date(user.premium_until) > new Date()) ? (
                <Badge className="bg-amber-500 hover:bg-amber-600">Premium</Badge>
              ) : (
                <Badge variant="outline">Standard</Badge>
              )}
            </TableCell>
            <TableCell>
              {format(new Date(user.created_at), "dd MMMM yyyy", { locale: fr })}
            </TableCell>
            <TableCell>
              {user.premium_until ? (
                new Date(user.premium_until) > new Date() ? 
                  format(new Date(user.premium_until), "dd MMMM yyyy", { locale: fr }) : 
                  "Expiré"
              ) : (
                "N/A"
              )}
            </TableCell>
            <TableCell className="text-right">
              {user.role !== "admin" && (
                <Button
                  variant={user.role === "premium" ? "outline" : "default"}
                  size="sm"
                  onClick={() => onTogglePremium(user.id, user.role, user.premium_until)}
                >
                  {user.role === "premium" ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Retirer Premium
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Donner Premium
                    </>
                  )}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
