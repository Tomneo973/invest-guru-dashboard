
import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useUserTransactions } from "../hooks/useUserTransactions";
import { useAdminActions } from "../hooks/useAdminActions";
import { Dialog } from "@/components/ui/dialog";
import UserSearchBar from "./user-management/UserSearchBar";
import UserTable from "./user-management/UserTable";
import UserDetailsDialog from "./user-management/UserDetailsDialog";

interface User {
  id: string;
  email?: string;
  created_at: string;
  role: string;
  avatar_url?: string | null;
  birthday?: string | null;
  country?: string | null;
  premium_until?: string | null;
}

const UserManagement = () => {
  const { users, loading, fetchUsers } = useUsers();
  const { userTransactions, loadingTransactions, fetchUserTransactions } = useUserTransactions();
  const { toggleAdminRole } = useAdminActions();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    fetchUserTransactions(user.id);
    setDialogOpen(true);
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const result = await toggleAdminRole(userId, currentRole);
    if (result.success) {
      // Update the local users state to reflect the role change
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, role: result.newRole || (currentRole === "admin" ? "user" : "admin") };
        }
        return user;
      });
      // We're not directly setting users here because they come from the useUsers hook
      // Instead, we'll refresh the data to get the updated roles
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.id?.toLowerCase().includes(searchLower) ||
      user.country?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <UserSearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={fetchUsers}
      />

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onViewDetails={handleViewDetails}
          onToggleRole={handleToggleRole}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <UserDetailsDialog
          user={selectedUser}
          transactions={userTransactions}
          loadingTransactions={loadingTransactions}
          onClose={() => setDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default UserManagement;
