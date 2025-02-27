
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListFilter } from "lucide-react";

interface PositionsCardProps {
  numberOfPositions: number;
}

export function PositionsCard({ numberOfPositions }: PositionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Nombre de Positions</CardTitle>
        <ListFilter className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{numberOfPositions}</div>
      </CardContent>
    </Card>
  );
}
