
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Shield } from "lucide-react";
import { 
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: string;
  created_at: string;
  role: string;
  avatar_url?: string | null;
  birthday?: string | null;
  country?: string | null;
  premium_until?: string | null;
}

interface UserTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onToggleRole: (userId: string, currentRole: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onViewDetails,
  onToggleRole,
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead>Pays</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-mono text-xs">{user.id}</TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>{user.country || "Non spécifié"}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === "admin" 
                    ? "bg-purple-100 text-purple-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {user.role || "user"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onViewDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onToggleRole(user.id, user.role || "user")}
                    title={user.role === "admin" ? "Retirer les droits admin" : "Promouvoir en admin"}
                  >
                    <Shield className={`h-4 w-4 ${
                      user.role === "admin" ? "text-purple-600" : "text-gray-400"
                    }`} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
