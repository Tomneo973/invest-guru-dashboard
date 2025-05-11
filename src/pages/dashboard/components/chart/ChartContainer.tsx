
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TimeRangeSelector } from "../TimeRangeSelector";
import { TimeRange } from "../hooks/useTimeRangeFilter";

interface ChartContainerProps {
  title: string;
  isLoading: boolean;
  isUpdating: boolean;
  hasData: boolean;
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onUpdate: () => void;
  children: React.ReactNode;
}

export function ChartContainer({
  title,
  isLoading,
  isUpdating,
  hasData,
  selectedRange,
  onRangeChange,
  onUpdate,
  children,
}: ChartContainerProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Chargement des données...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-4">
            <TimeRangeSelector
              selectedRange={selectedRange}
              onRangeChange={onRangeChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdate}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
              {isUpdating ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {isUpdating ? "Mise à jour des données..." : "Aucune donnée disponible. Cliquez sur 'Mettre à jour' pour récupérer vos données."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-4">
          <TimeRangeSelector
            selectedRange={selectedRange}
            onRangeChange={onRangeChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdate}
            disabled={isUpdating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
            {isUpdating ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
