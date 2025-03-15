
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  // Fonction pour obtenir la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score >= 15) return "text-green-600";
    if (score >= 10) return "text-amber-600";
    return "text-red-600";
  };

  // Fonction pour obtenir la couleur de la barre de progression
  const getProgressColor = (score: number) => {
    if (score >= 15) return "bg-green-600";
    if (score >= 10) return "bg-amber-600";
    return "bg-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <span>Informations financières - {data.name} ({data.symbol})</span>
          {data.score !== undefined && (
            <div className="mt-2 md:mt-0 flex items-center">
              <span className={`text-xl font-bold ${getScoreColor(data.score)}`}>
                {data.score}/20
              </span>
              <span className="ml-2 text-sm text-gray-500">
                {data.score >= 15 ? "Très recommandé" : 
                 data.score >= 10 ? "Potentiellement intéressant" : 
                 "Non recommandé"}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.scoreDetails && (
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-lg">Détail du score</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Valeur (sous/surévaluation)</span>
                  <span className="text-sm">{data.scoreDetails.valueScore}/4</span>
                </div>
                <Progress value={data.scoreDetails.valueScore * 25} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.valueScore * 5)}`} 
                    style={{ width: `${data.scoreDetails.valueScore * 25}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Croissance</span>
                  <span className="text-sm">{data.scoreDetails.growthScore}/4</span>
                </div>
                <Progress value={data.scoreDetails.growthScore * 25} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.growthScore * 5)}`} 
                    style={{ width: `${data.scoreDetails.growthScore * 25}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Rentabilité</span>
                  <span className="text-sm">{data.scoreDetails.profitabilityScore}/4</span>
                </div>
                <Progress value={data.scoreDetails.profitabilityScore * 25} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.profitabilityScore * 5)}`} 
                    style={{ width: `${data.scoreDetails.profitabilityScore * 25}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Dividendes</span>
                  <span className="text-sm">{data.scoreDetails.dividendScore}/4</span>
                </div>
                <Progress value={data.scoreDetails.dividendScore * 25} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.dividendScore * 5)}`} 
                    style={{ width: `${data.scoreDetails.dividendScore * 25}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Momentum</span>
                  <span className="text-sm">{data.scoreDetails.momentumScore}/4</span>
                </div>
                <Progress value={data.scoreDetails.momentumScore * 25} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.momentumScore * 5)}`} 
                    style={{ width: `${data.scoreDetails.momentumScore * 25}%` }}
                  ></div>
                </Progress>
              </div>
            </div>
          </div>
        )}

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
