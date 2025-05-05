
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChartLine, DollarSign, LineChart, BarChart3, Building } from "lucide-react";
import { MarketNewsSection } from "@/components/MarketNewsSection";
import { RealEstateShowcase } from "@/components/RealEstateShowcase";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Suivi des Transactions",
      description: "Gérez et suivez toutes vos transactions boursières en temps réel",
      icon: ChartLine,
    },
    {
      title: "Gestion des Dividendes",
      description: "Visualisez et anticipez vos revenus passifs grâce au suivi des dividendes",
      icon: DollarSign,
    },
    {
      title: "Analyses Statistiques",
      description: "Obtenez des insights détaillés sur la performance de votre portfolio",
      icon: LineChart,
    },
    {
      title: "Répartition du Portfolio",
      description: "Visualisez la diversification de vos investissements par secteur et région",
      icon: BarChart3,
    },
    {
      title: "Patrimoine Immobilier",
      description: "Gérez vos biens immobiliers et analysez leur rentabilité après impôts",
      icon: Building,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-semibold">Portfolio Tracker</div>
            <Button 
              variant="default"
              onClick={() => navigate("/auth")}
              className="bg-black hover:bg-gray-800"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Le meilleur moment pour investir, <br />
              <span className="text-black">c'est maintenant.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Prenez le contrôle de vos investissements avec notre plateforme complète de suivi de portfolio.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-black hover:bg-gray-800"
            >
              Commencer gratuitement
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Tout ce dont vous avez besoin pour gérer vos investissements
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-black mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Estate Showcase Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Gestion immobilière optimisée
            </h2>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
              Suivez la rentabilité de vos biens immobiliers en temps réel, en prenant en compte tous les frais et impôts
            </p>
          </div>
          <RealEstateShowcase />
        </div>
      </div>

      {/* Market News Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Dernières Actualités Boursières
            </h2>
          </div>
          <MarketNewsSection refreshInterval={60000} />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Prêt à commencer votre voyage d'investisseur ?
          </h2>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/auth")}
            className="bg-white text-black hover:bg-gray-100"
          >
            Créer un compte gratuitement
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Portfolio Tracker. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
