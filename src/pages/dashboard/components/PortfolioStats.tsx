
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Database, ListFilter, Trophy, Skull, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types pour les taux de change et les montants par devise
interface CurrencyAmount {
  currency: string;
  amount: number;
}

interface ExchangeRate {
  currency: string;
  rate: number;
}

interface PortfolioStatsProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  numberOfPositions: number;
  top5Returns: Array<{ symbol: string; returnPercentage: number }>;
  flop5Returns: Array<{ symbol: string; returnPercentage: number }>;
  currencyAmounts?: CurrencyAmount[]; // Montants par devise
}

// Taux de change simulés (à remplacer par une API réelle)
const mockExchangeRates: Record<string, Record<string, number>> = {
  CHF: { USD: 1.12, EUR: 1.04, GBP: 0.88, CHF: 1 },
  USD: { CHF: 0.89, EUR: 0.93, GBP: 0.78, USD: 1 },
  EUR: { CHF: 0.96, USD: 1.08, GBP: 0.84, EUR: 1 },
  GBP: { CHF: 1.14, USD: 1.28, EUR: 1.19, GBP: 1 }
};

export function PortfolioStats({
  totalInvested,
  totalCurrentValue,
  totalReturn,
  totalReturnPercentage,
  numberOfPositions,
  top5Returns,
  flop5Returns,
  currencyAmounts = [
    { currency: "CHF", amount: totalCurrentValue * 0.3 },
    { currency: "USD", amount: totalCurrentValue * 0.4 },
    { currency: "EUR", amount: totalCurrentValue * 0.2 },
    { currency: "GBP", amount: totalCurrentValue * 0.1 }
  ]
}: PortfolioStatsProps) {
  // État pour stocker la devise sélectionnée
  const [selectedCurrency, setSelectedCurrency] = useState("CHF");
  const [convertedValue, setConvertedValue] = useState(totalCurrentValue);
  const [convertedInvested, setConvertedInvested] = useState(totalInvested);
  const [convertedReturn, setConvertedReturn] = useState(totalReturn);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    // Conversion des montants selon la devise sélectionnée
    let newTotal = 0;
    const rates: ExchangeRate[] = [];

    // Calculer la valeur totale convertie
    currencyAmounts.forEach(({ currency, amount }) => {
      const rate = mockExchangeRates[selectedCurrency][currency] || 1;
      newTotal += amount / rate;
      rates.push({ currency, rate: rate });
    });

    setConvertedValue(newTotal);
    
    // Convertir également le montant investi et le retour
    const conversionRatio = newTotal / totalCurrentValue;
    setConvertedInvested(totalInvested * conversionRatio);
    setConvertedReturn(totalReturn * conversionRatio);
    setExchangeRates(rates);
    
  }, [selectedCurrency, currencyAmounts, totalCurrentValue, totalInvested, totalReturn]);

  // Liste des devises disponibles pour la sélection
  const availableCurrencies = ["CHF", "USD", "EUR", "GBP"];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investi</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedInvested.toLocaleString()} {selectedCurrency}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">Valeur Actuelle</CardTitle>
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="w-[80px] h-7">
                  <SelectValue placeholder="Devise" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedValue.toLocaleString()} {selectedCurrency}</div>
            <div className="grid grid-cols-2 gap-1 mt-2 text-xs text-muted-foreground">
              {currencyAmounts.map(({ currency, amount }) => (
                <div key={currency} className="flex justify-between">
                  <span>{currency}:</span>
                  <span>{amount.toLocaleString()} {currency}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-muted-foreground">
              <div className="font-medium mb-1">Taux de change (1 {selectedCurrency} =)</div>
              <div className="grid grid-cols-2 gap-1">
                {exchangeRates.map(({ currency, rate }) => (
                  currency !== selectedCurrency && (
                    <div key={currency} className="flex justify-between">
                      <span>{currency}:</span>
                      <span>{(1/rate).toFixed(4)} {currency}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retour Total</CardTitle>
            {convertedReturn > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${convertedReturn > 0 ? "text-green-500" : "text-red-500"}`}>
              {convertedReturn.toLocaleString()} {selectedCurrency} ({totalReturnPercentage.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Positions</CardTitle>
            <ListFilter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfPositions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Retours</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {top5Returns.map(({ symbol, returnPercentage }) => (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol}</span>
                  <span className="text-green-500">+{returnPercentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flop 5 Retours</CardTitle>
            <Skull className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {flop5Returns.map(({ symbol, returnPercentage }) => (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol}</span>
                  <span className="text-red-500">{returnPercentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
