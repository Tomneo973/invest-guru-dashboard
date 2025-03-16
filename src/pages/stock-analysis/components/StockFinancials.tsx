
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StockFinancialData } from "@/services/stockAnalysis";

interface StockFinancialsProps {
  data: StockFinancialData;
}

export function StockFinancials({ data }: StockFinancialsProps) {
  // Format percentage values for display
  const formatPercentage = (value?: number) => {
    if (value === undefined) return "N/A";
    return `${(value * 100).toFixed(2)}%`;
  };

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
    { label: "Rendement du dividende", value: formatPercentage(data.dividendYield) },
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

  const fundamentalMetrics = [
    { 
      label: "Marge brute", 
      value: formatPercentage(data.grossMargin),
      className: data.grossMargin ? 
        (data.grossMargin > 0.4 ? "text-green-600" : data.grossMargin < 0.1 ? "text-red-600" : "") : ""
    },
    { 
      label: "Croissance des revenus", 
      value: formatPercentage(data.revenueGrowth),
      className: data.revenueGrowth ? 
        (data.revenueGrowth > 0.15 ? "text-green-600" : data.revenueGrowth < 0.02 ? "text-red-600" : "") : ""
    },
    { 
      label: "Taux de couverture des intérêts", 
      value: data.interestCoverage ? data.interestCoverage.toLocaleString() : "N/A",
      className: data.interestCoverage ? 
        (data.interestCoverage > 5 ? "text-green-600" : data.interestCoverage < 1.5 ? "text-red-600" : "") : ""
    },
    { 
      label: "Ratio dette/capitaux propres", 
      value: data.debtToEquity ? data.debtToEquity.toLocaleString() : "N/A",
      className: data.debtToEquity ? 
        (data.debtToEquity < 1 ? "text-green-600" : data.debtToEquity > 4 ? "text-red-600" : "") : ""
    },
    { 
      label: "Flux de trésorerie d'exploitation/ventes", 
      value: formatPercentage(data.operatingCashflowToSales),
      className: data.operatingCashflowToSales ? 
        (data.operatingCashflowToSales > 0.15 ? "text-green-600" : data.operatingCashflowToSales < 0.05 ? "text-red-600" : "") : ""
    },
  ];

  // Fonction pour obtenir la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score >= 15) return "text-green-600";
    if (score >= 10) return "text-amber-600";
    return "text-red-600";
  };

  // Fonction pour obtenir la couleur de la barre de progression
  const getProgressColor = (score: number, max: number) => {
    const normalizedScore = (score / max) * 20; // Normalize to /20
    if (normalizedScore >= 15) return "bg-green-600";
    if (normalizedScore >= 10) return "bg-amber-600";
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
                  <span className="text-sm">{data.scoreDetails.valueScore}/3</span>
                </div>
                <Progress value={data.scoreDetails.valueScore * 100 / 3} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.valueScore, 3)}`} 
                    style={{ width: `${data.scoreDetails.valueScore * 100 / 3}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Croissance</span>
                  <span className="text-sm">{data.scoreDetails.growthScore}/3</span>
                </div>
                <Progress value={data.scoreDetails.growthScore * 100 / 3} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.growthScore, 3)}`} 
                    style={{ width: `${data.scoreDetails.growthScore * 100 / 3}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Rentabilité</span>
                  <span className="text-sm">{data.scoreDetails.profitabilityScore}/3</span>
                </div>
                <Progress value={data.scoreDetails.profitabilityScore * 100 / 3} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.profitabilityScore, 3)}`} 
                    style={{ width: `${data.scoreDetails.profitabilityScore * 100 / 3}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Dividendes</span>
                  <span className="text-sm">{data.scoreDetails.dividendScore}/3</span>
                </div>
                <Progress value={data.scoreDetails.dividendScore * 100 / 3} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.dividendScore, 3)}`} 
                    style={{ width: `${data.scoreDetails.dividendScore * 100 / 3}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Momentum</span>
                  <span className="text-sm">{data.scoreDetails.momentumScore}/3</span>
                </div>
                <Progress value={data.scoreDetails.momentumScore * 100 / 3} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.momentumScore, 3)}`} 
                    style={{ width: `${data.scoreDetails.momentumScore * 100 / 3}%` }}
                  ></div>
                </Progress>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Fondamentaux</span>
                  <span className="text-sm">{data.scoreDetails.fundamentalsScore}/5</span>
                </div>
                <Progress value={data.scoreDetails.fundamentalsScore * 100 / 5} className="h-2">
                  <div 
                    className={`h-full ${getProgressColor(data.scoreDetails.fundamentalsScore, 5)}`} 
                    style={{ width: `${data.scoreDetails.fundamentalsScore * 100 / 5}%` }}
                  ></div>
                </Progress>
              </div>
            </div>
          </div>
        )}

        {/* Fondamentaux */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-4">Indicateurs fondamentaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fundamentalMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between border-b border-gray-100 py-2">
                <span className="font-medium">{metric.label}</span>
                <span className={metric.className}>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Informations générales */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financialMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between border-b border-gray-100 py-2">
                <span className="font-medium">{metric.label}</span>
                <span className={metric.className}>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
