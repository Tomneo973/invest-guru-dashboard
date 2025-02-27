
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyAmount, ExchangeRate, mockExchangeRates } from "./types/portfolioStats";

interface CurrentValueCardProps {
  totalCurrentValue: number;
  totalInvested: number;
  totalReturn: number;
  currencyAmounts: CurrencyAmount[];
  onCurrencyChange: (currency: string, convertedValue: number, convertedInvested: number, convertedReturn: number) => void;
}

export function CurrentValueCard({
  totalCurrentValue,
  totalInvested,
  totalReturn,
  currencyAmounts,
  onCurrencyChange
}: CurrentValueCardProps) {
  // État pour stocker la devise sélectionnée
  const [selectedCurrency, setSelectedCurrency] = useState("CHF");
  const [convertedValue, setConvertedValue] = useState(totalCurrentValue);
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
    setExchangeRates(rates);
    
    // Convertir également le montant investi et le retour
    const conversionRatio = newTotal / totalCurrentValue;
    const convertedInvested = totalInvested * conversionRatio;
    const convertedReturn = totalReturn * conversionRatio;
    
    // Notifier le parent du changement de devise
    onCurrencyChange(selectedCurrency, newTotal, convertedInvested, convertedReturn);
    
  }, [selectedCurrency, currencyAmounts, totalCurrentValue, totalInvested, totalReturn, onCurrencyChange]);

  // Liste des devises disponibles pour la sélection
  const availableCurrencies = ["CHF", "USD", "EUR", "GBP"];

  return (
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
        <div className="mt-2 text-xs text-muted-foreground">
          {currencyAmounts.map(({ currency, amount }) => (
            <div key={currency} className="flex justify-between border-b border-gray-100 py-1">
              <span className="text-left">{currency}:</span>
              <span className="text-right">{amount.toLocaleString()} {currency}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-muted-foreground">
          <div className="font-medium mb-1">Taux de change (1 {selectedCurrency} =)</div>
          <div>
            {exchangeRates.map(({ currency, rate }) => (
              currency !== selectedCurrency && (
                <div key={currency} className="flex justify-between py-1">
                  <span className="text-left">{currency}:</span>
                  <span className="text-right">{(1/rate).toFixed(4)} {currency}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
