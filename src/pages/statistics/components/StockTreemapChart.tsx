
import { useState } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Holding = {
  symbol: string;
  shares: number;
  total_invested: number;
  current_value: number;
  sector: string;
};

type StockTreemapChartProps = {
  holdings: Holding[];
};

type TreemapData = {
  name: string;
  children?: TreemapData[];
  value: number;
  gainLoss?: number;
  gainLossPercentage?: number;
  portfolioPercentage?: number;
  shares?: number;
  averagePurchasePrice?: number;
};

type CustomTreemapContentProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  gainLoss?: number;
  gainLossPercentage?: number;
  portfolioPercentage?: number;
  depth?: number;
  sector?: string;
};

// Couleurs distinctes pour chaque secteur
const SECTOR_COLORS = {
  "Technology": "#3b82f6",
  "Finance": "#22c55e",
  "Healthcare": "#f59e0b",
  "Consumer": "#ef4444",
  "Energy": "#8b5cf6",
  "Industry": "#ec4899",
  "Materials": "#14b8a6",
  "Real Estate": "#6366f1",
  "Utilities": "#84cc16",
  "Communication": "#f97316",
  "Non catégorisé": "#94a3b8"
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

const CustomTreemapContent = ({ 
  x = 0, 
  y = 0, 
  width = 0, 
  height = 0, 
  name = '', 
  gainLoss = 0, 
  gainLossPercentage = 0, 
  portfolioPercentage = 0,
  depth = 0,
  sector = 'Non catégorisé'
}: CustomTreemapContentProps) => {
  if (!width || !height || width < 0 || height < 0) return null;

  const bgColor = depth === 1 
    ? gainLoss >= 0 
      ? `rgba(34, 197, 94, 0.9)` // Vert pour les gains
      : `rgba(239, 68, 68, 0.9)` // Rouge pour les pertes
    : `${SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS] || SECTOR_COLORS["Non catégorisé"]}`;
  
  const textColor = 'rgb(255, 255, 255)';
  const fontSize = depth === 1 ? 12 : 14;
  const fontWeight = depth === 1 ? "normal" : "bold";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={bgColor}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth={2}
      />
      {width > 50 && height > 50 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - (depth === 1 ? 12 : 0)}
            textAnchor="middle"
            fill={textColor}
            fontSize={fontSize}
            fontWeight={fontWeight}
          >
            {name}
          </text>
          {depth === 1 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              fill={textColor}
              fontSize={12}
            >
              {`${portfolioPercentage.toFixed(1)}% (${gainLoss >= 0 ? '+' : ''}${gainLossPercentage.toFixed(1)}%)`}
            </text>
          )}
        </>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  
  if (!data.shares) { // C'est un secteur
    return (
      <div className="bg-white/95 p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold mb-2">Secteur : {data.name}</p>
        <p>Valeur totale: {formatCurrency(data.value || 0)}</p>
        <p>Part du portfolio: {(data.portfolioPercentage || 0).toFixed(1)}%</p>
      </div>
    );
  }

  return (
    <div className="bg-white/95 p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold mb-2">{data.name}</p>
      <div className="space-y-1 text-sm">
        <p>Valeur totale: {formatCurrency(data.value || 0)}</p>
        <p className={data.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
          Plus/Moins value: {formatCurrency(data.gainLoss || 0)} ({data.gainLoss >= 0 ? '+' : ''}
          {(data.gainLossPercentage || 0).toFixed(2)}%)
        </p>
        <p>Part du portfolio: {(data.portfolioPercentage || 0).toFixed(1)}%</p>
        <p>PRU: {(data.averagePurchasePrice || 0).toFixed(2)} €</p>
        <p>Quantité: {data.shares || 0}</p>
      </div>
    </div>
  );
};

export function StockTreemapChart({ holdings }: StockTreemapChartProps) {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.current_value, 0);

  // Organiser les données par secteur
  const sectorMap = holdings.reduce((acc, holding) => {
    const sector = holding.sector || "Non catégorisé";
    if (!acc[sector]) {
      acc[sector] = [];
    }
    acc[sector].push(holding);
    return acc;
  }, {} as Record<string, Holding[]>);

  // Calculer les données pour le treemap
  const data = selectedSector === "all" 
    ? Object.entries(sectorMap).map(([sector, holdings]) => ({
        name: sector,
        value: holdings.reduce((sum, h) => sum + h.current_value, 0),
        children: holdings.map(holding => ({
          name: holding.symbol,
          value: holding.current_value,
          shares: holding.shares,
          gainLoss: holding.current_value - holding.total_invested,
          gainLossPercentage: holding.total_invested > 0 
            ? ((holding.current_value - holding.total_invested) / holding.total_invested) * 100 
            : 0,
          portfolioPercentage: (holding.current_value / totalPortfolioValue) * 100,
          averagePurchasePrice: holding.shares > 0 
            ? holding.total_invested / holding.shares 
            : 0,
        })),
        sector,
      }))
    : sectorMap[selectedSector]?.map(holding => ({
        name: holding.symbol,
        value: holding.current_value,
        shares: holding.shares,
        gainLoss: holding.current_value - holding.total_invested,
        gainLossPercentage: holding.total_invested > 0 
          ? ((holding.current_value - holding.total_invested) / holding.total_invested) * 100 
          : 0,
        portfolioPercentage: (holding.current_value / totalPortfolioValue) * 100,
        averagePurchasePrice: holding.shares > 0 
          ? holding.total_invested / holding.shares 
          : 0,
        sector: selectedSector,
      })) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select
          value={selectedSector}
          onValueChange={setSelectedSector}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner un secteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tous les secteurs</SelectItem>
              {Object.keys(sectorMap).map(sector => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={data}
          dataKey="value"
          stroke="#fff"
          content={<CustomTreemapContent />}
          animationDuration={0}
          isAnimationActive={false}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
