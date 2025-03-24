
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star } from "lucide-react";

export const PremiumBadge = ({ className = "" }: { className?: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={`bg-amber-500 hover:bg-amber-500 ${className}`}>
            <Star className="h-3 w-3 mr-1" /> Premium
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Fonctionnalité réservée aux abonnés Premium</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
