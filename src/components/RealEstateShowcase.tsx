
import { useEffect, useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Building, TrendingUp, Calculator, Landmark, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types pour un bien immobilier de démonstration
interface ShowcaseProperty {
  id: number;
  title: string;
  address: string;
  imageUrl: string;
  purchasePrice: number;
  monthlyRent: number;
  propertyTax: number;
  householdTax: number;
  description: string;
  roi: number; // Rendement affiché en pourcentage
}

// Données de démonstration
const showcaseProperties: ShowcaseProperty[] = [
  {
    id: 1,
    title: "Appartement T3 Centre-Ville",
    address: "12 rue de la Paix, 75002 Paris",
    imageUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop",
    purchasePrice: 350000,
    monthlyRent: 1500,
    propertyTax: 1200,
    householdTax: 800,
    description: "Superbe appartement en plein cœur du centre-ville, idéal pour un investissement locatif.",
    roi: 4.2
  },
  {
    id: 2,
    title: "Maison avec Jardin",
    address: "5 avenue des Tilleuls, 69006 Lyon",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop",
    purchasePrice: 420000,
    monthlyRent: 1800,
    propertyTax: 1500,
    householdTax: 950,
    description: "Belle maison familiale avec jardin dans un quartier résidentiel prisé.",
    roi: 3.8
  },
  {
    id: 3,
    title: "Studio Étudiant",
    address: "3 rue de l'Université, 34000 Montpellier",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
    purchasePrice: 120000,
    monthlyRent: 550,
    propertyTax: 400,
    householdTax: 250,
    description: "Studio idéal pour investissement locatif étudiant, à proximité des universités.",
    roi: 5.1
  }
];

// Fonction d'utilitaire pour formater les montants en euros
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const RealEstateShowcase = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Gestion du changement automatique de slide toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % showcaseProperties.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col space-y-8">
      <Carousel className="max-w-4xl mx-auto w-full">
        <CarouselContent>
          {showcaseProperties.map((property) => (
            <CarouselItem key={property.id}>
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="relative h-64 w-full">
                  <img 
                    src={property.imageUrl} 
                    alt={property.title} 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <h3 className="text-xl font-bold">{property.title}</h3>
                    <p>{property.address}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Prix d'achat</p>
                      <p className="font-semibold">{formatCurrency(property.purchasePrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loyer mensuel</p>
                      <p className="font-semibold">{formatCurrency(property.monthlyRent)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Taxe foncière</p>
                      <p className="font-semibold">{formatCurrency(property.propertyTax)}/an</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rentabilité nette</p>
                      <p className="font-semibold text-emerald-600">{property.roi.toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{property.description}</p>
                  <button 
                    onClick={() => navigate("/auth")} 
                    className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Gérer mes biens
                  </button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <FeatureCard 
          icon={Building} 
          title="Suivez vos biens" 
          description="Centralisez toutes les informations de vos biens immobiliers"
        />
        <FeatureCard 
          icon={TrendingUp} 
          title="Analysez la rentabilité" 
          description="Mesurez précisément le rendement de vos investissements"
        />
        <FeatureCard 
          icon={Calculator} 
          title="Calculez les impôts" 
          description="Intégrez les taxes foncières et autres impôts dans vos calculs"
        />
        <FeatureCard 
          icon={Ban} 
          title="Évitez les mauvaises surprises" 
          description="Anticipez les charges et maintenez votre rentabilité"
        />
      </div>
    </div>
  );
};

// Composant pour les cartes de fonctionnalités
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <Icon className="h-8 w-8 mb-3 text-black" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};
