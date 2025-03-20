
import { useState } from "react";
import { InvestedCard } from "./InvestedCard";
import { CurrentValueCard } from "./CurrentValueCard";
import { ReturnCard } from "./ReturnCard";
import { PositionsCard } from "./PositionsCard";
import { TopReturnsCard } from "./TopReturnsCard";
import { FlopReturnsCard } from "./FlopReturnsCard";
import { PortfolioStatsProps } from "./types/portfolioStats";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [selectedCurrency, setSelectedCurrency] = useState("CHF");
  const [convertedInvested, setConvertedInvested] = useState(totalInvested);
  const [convertedValue, setConvertedValue] = useState(totalCurrentValue);
  const [convertedReturn, setConvertedReturn] = useState(totalReturn);
  const isMobile = useIsMobile();

  const handleCurrencyChange = (
    currency: string, 
    newValue: number, 
    newInvested: number, 
    newReturn: number
  ) => {
    setSelectedCurrency(currency);
    setConvertedValue(newValue);
    setConvertedInvested(newInvested);
    setConvertedReturn(newReturn);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InvestedCard 
          totalInvested={convertedInvested} 
          currency={selectedCurrency} 
        />
        <CurrentValueCard 
          totalCurrentValue={totalCurrentValue}
          totalInvested={totalInvested}
          totalReturn={totalReturn}
          currencyAmounts={currencyAmounts}
          onCurrencyChange={handleCurrencyChange}
        />
        <ReturnCard 
          totalReturn={convertedReturn} 
          totalReturnPercentage={totalReturnPercentage} 
          currency={selectedCurrency} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PositionsCard numberOfPositions={numberOfPositions} />
        <TopReturnsCard returns={top5Returns} />
        <FlopReturnsCard returns={flop5Returns} />
      </div>
    </>
  );
}
