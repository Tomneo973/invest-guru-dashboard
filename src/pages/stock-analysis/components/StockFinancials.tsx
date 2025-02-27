
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockFinancialData } from "@/services/stockAnalysis";

interface StockFinancialsProps {
  data: StockFinancialData;
}

export function StockFinancials({ data }: StockFinancialsProps) {
  const financialMetrics = [
    { label: "Cours actuel", value: `${data.currentPrice.toLocaleString()} ${data.currency}` },
    { label: "Prix juste (EPS × P/E)", value: `${data.fairPrice?.toLocaleString() || 'N/A'} ${data.currency}` },
    { label: "Valorisation", value: data.fairPrice && data.currentPrice ? 
      (data.currentPrice < data.fairPrice ? "Sous-évalué" : "Surévalué") : "N/A",
      className: data.fairPrice && data.currentPrice ? 
        (data.currentPrice < data.fairPrice ? "text-green-600" : "text-red-600") : "" 
    },
    { label: "BPA (EPS)", value: `${data.eps.toLocaleString()} ${data.currency}` },
    { label: "Ratio P/E", value: data.peRatio.toLocaleString() },
    { label: "Ratio P/E prévisionnel", value: data.forwardPE.toLocaleString() },
    { label: "Rendement du dividende", value: `${(data.dividendYield * 100).toFixed(2)}%` },
    { label: "Capitalisation boursière", value: `${(data.marketCap / 1000000000).toFixed(2)} Mrd ${data.currency}` },
    { label: "52 semaines - Haut", value: `${data.fiftyTwoWeekHigh.toLocaleString()} ${data.currency}` },
    { label: "52 semaines - Bas", value: `${data.fiftyTwoWeekLow.toLocaleString()} ${data.currency}` },
    { label: "Valeur comptable", value: data.bookValue ? `${data.bookValue.toLocaleString()} ${data.currency}` : "N/A" },
    { label: "Ratio prix/valeur comptable", value: data.priceToBook ? data.priceToBook.toLocaleString() : "N/A" },
    { label: "Prix cible", value: data.targetPrice ? `${data.targetPrice.toLocaleString()} ${data.currency}` : "N/A" },
    { label: "Secteur", value: data.sector || "N/A" },
    { label: "Industrie", value: data.industry || "N/A" },
    { label: "Recommandation", value: data.recommendation || "N/A" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations financières - {data.name} ({data.symbol})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financialMetrics.map((metric, index) => (
            <div key={index} className="flex justify-between border-b border-gray-100 py-2">
              <span className="font-medium">{metric.label}</span>
              <span className={metric.className}>{metric.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
