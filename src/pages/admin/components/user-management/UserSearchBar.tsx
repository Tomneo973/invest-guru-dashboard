
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

interface UserSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onRefresh: () => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onRefresh,
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par ID, pays..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Actualiser
      </Button>
    </div>
  );
};

export default UserSearchBar;
