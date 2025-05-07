
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RealEstateProperty } from "../../types";
import { TransactionForm } from "./TransactionForm";
import { TransactionHistory } from "./TransactionHistory";
import { TransactionAnalysis } from "./TransactionAnalysis";

interface PropertyTransactionsTabProps {
  property: RealEstateProperty;
}

export function PropertyTransactionsTab({ property }: PropertyTransactionsTabProps) {
  const [activeView, setActiveView] = useState("history");
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transactions financières</h3>
        <Button onClick={() => setShowTransactionForm(true)} size="sm">
          Ajouter une transaction
        </Button>
      </div>

      {showTransactionForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nouvelle transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm 
              propertyId={property.id} 
              onSuccess={() => setShowTransactionForm(false)} 
            />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="flows">Flux financiers</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <TransactionHistory propertyId={property.id} />
        </TabsContent>

        <TabsContent value="flows">
          <TransactionFlowChart propertyId={property.id} />
        </TabsContent>

        <TabsContent value="analysis">
          <TransactionAnalysis propertyId={property.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Composant pour afficher le flux financier sur une échelle de temps
function TransactionFlowChart({ propertyId }: { propertyId: string }) {
  const { data, isLoading } = useTransactionFlow(propertyId);
  
  if (isLoading) {
    return <div className="py-10 text-center">Chargement des données...</div>;
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Aucune transaction enregistrée</p>
      </div>
    );
  }
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="cumulativeBalance" 
            fill="rgba(75, 192, 192, 0.2)" 
            stroke="#4bc0c0" 
            name="Solde cumulé" 
          />
          <Bar 
            dataKey="income" 
            fill="#4caf50" 
            name="Revenus" 
          />
          <Bar 
            dataKey="expense" 
            fill="#f44336" 
            name="Dépenses" 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Import des dépendances nécessaires pour le graphique
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { useTransactionFlow } from "../../hooks/useTransactionFlow";

