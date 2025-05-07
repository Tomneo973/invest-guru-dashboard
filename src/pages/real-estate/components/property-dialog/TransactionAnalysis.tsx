
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { useTransactionAnalysis } from "../../hooks/useTransactionAnalysis";

interface TransactionAnalysisProps {
  propertyId: string;
}

export function TransactionAnalysis({ propertyId }: TransactionAnalysisProps) {
  const [timeframe, setTimeframe] = useState<"1year" | "3years" | "5years" | "10years" | "all">("all");
  const { data, isLoading } = useTransactionAnalysis(propertyId, timeframe);

  // Couleurs pour les graphiques
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  if (isLoading) {
    return <div className="py-10 text-center">Chargement des données d'analyse...</div>;
  }

  if (!data) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Données d'analyse non disponibles</p>
      </div>
    );
  }

  const { summary, expenseCategories, incomeCategories, monthlyData } = data;

  // Formateur de montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Filtres par période */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTimeframe("1year")}
          className={`px-3 py-1 rounded-full text-xs ${
            timeframe === "1year"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          1 an
        </button>
        <button
          onClick={() => setTimeframe("3years")}
          className={`px-3 py-1 rounded-full text-xs ${
            timeframe === "3years"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          3 ans
        </button>
        <button
          onClick={() => setTimeframe("5years")}
          className={`px-3 py-1 rounded-full text-xs ${
            timeframe === "5years"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          5 ans
        </button>
        <button
          onClick={() => setTimeframe("10years")}
          className={`px-3 py-1 rounded-full text-xs ${
            timeframe === "10years"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          10 ans
        </button>
        <button
          onClick={() => setTimeframe("all")}
          className={`px-3 py-1 rounded-full text-xs ${
            timeframe === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          Tout
        </button>
      </div>

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(summary.totalIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatAmount(Math.abs(summary.totalExpenses))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bénéfice net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatAmount(summary.netProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rendement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.yield >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary.yield.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribution des dépenses */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des dépenses</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {expenseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(Math.abs(Number(value)))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Aucune dépense enregistrée</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution des revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des revenus</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {incomeCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Aucun revenu enregistré</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" name="Revenus" fill="#4caf50" />
                  <Bar dataKey="expenses" name="Dépenses" fill="#f44336" />
                  <Bar dataKey="profit" name="Bénéfice" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Données insuffisantes pour l'évolution mensuelle</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
