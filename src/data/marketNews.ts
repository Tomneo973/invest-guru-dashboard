
// Données pour les actualités boursières
export interface MarketNews {
  id: number;
  title: string;
  excerpt: string;
  timestamp: string;
  source: string;
  imageUrl?: string;
  url?: string; // URL facultative vers l'article complet
}

// Collection d'actualités boursières différentes
export const marketNewsData: MarketNews[] = [
  {
    id: 1,
    title: "Les marchés européens en hausse suite aux annonces de la BCE",
    excerpt: "Les principaux indices européens progressent ce matin, portés par les dernières décisions de politique monétaire de la Banque Centrale Européenne.",
    timestamp: "2h",
    source: "Financial Times",
    imageUrl: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.ft.com/markets/europe"
  },
  {
    id: 2,
    title: "Apple dévoile ses résultats trimestriels au-dessus des attentes",
    excerpt: "Le géant technologique a publié des résultats meilleurs que prévu, avec une hausse significative des ventes d'iPhone et des services en ligne.",
    timestamp: "5h",
    source: "Bloomberg",
    imageUrl: "https://images.unsplash.com/photo-1548094878-84ced0f6896d?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.bloomberg.com/technology"
  },
  {
    id: 3,
    title: "Hausse du pétrole suite aux tensions au Moyen-Orient",
    excerpt: "Les cours du brut ont progressé de plus de 3% en réaction aux récentes tensions géopolitiques, faisant craindre des perturbations dans l'approvisionnement.",
    timestamp: "7h",
    source: "Reuters",
    imageUrl: "https://images.unsplash.com/photo-1495864138289-87587a2ca936?q=80&w=1634&auto=format&fit=crop",
    url: "https://www.reuters.com/business/energy"
  },
  {
    id: 4,
    title: "La Fed maintient ses taux directeurs inchangés",
    excerpt: "La Réserve fédérale américaine a décidé de maintenir ses taux d'intérêt, mais signale une possible baisse pour le prochain trimestre.",
    timestamp: "12h",
    source: "CNBC",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.cnbc.com/federal-reserve"
  },
  {
    id: 5,
    title: "Nouvelle réglementation européenne sur les cryptomonnaies",
    excerpt: "L'Union Européenne a adopté un ensemble de règles visant à encadrer les activités liées aux cryptomonnaies et à protéger les investisseurs.",
    timestamp: "1j",
    source: "Euronews",
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.euronews.com/business/cryptocurrencies"
  },
  {
    id: 6,
    title: "Le CAC40 franchit un nouveau record historique",
    excerpt: "L'indice phare de la Bourse de Paris a atteint un plus haut historique, porté par les valeurs du luxe et de la technologie.",
    timestamp: "1j",
    source: "Les Échos",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.lesechos.fr/finance-marches/marches-financiers"
  },
  {
    id: 7,
    title: "Fusion majeure dans le secteur bancaire européen",
    excerpt: "Deux grandes banques européennes annoncent leur intention de fusionner, créant ainsi le troisième plus grand groupe bancaire de la zone euro.",
    timestamp: "2j",
    source: "Financial Times",
    imageUrl: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.ft.com/banking"
  },
  {
    id: 8,
    title: "Tesla dévoile sa nouvelle stratégie d'expansion internationale",
    excerpt: "Le constructeur de véhicules électriques a présenté son plan pour pénétrer de nouveaux marchés en Asie et en Amérique latine.",
    timestamp: "2j",
    source: "Wall Street Journal",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1471&auto=format&fit=crop",
    url: "https://www.wsj.com/business/autos"
  },
  {
    id: 9,
    title: "L'or atteint un nouveau sommet face aux incertitudes économiques",
    excerpt: "Le métal précieux continue sa hausse et s'établit à un niveau record, reflétant l'inquiétude des investisseurs face à l'inflation.",
    timestamp: "3j",
    source: "Reuters",
    imageUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.reuters.com/markets/commodities"
  },
  {
    id: 10,
    title: "Nouvelle réforme fiscale pour les investissements durables",
    excerpt: "Les gouvernements du G20 s'accordent sur des avantages fiscaux pour encourager les investissements dans les énergies renouvelables et les technologies vertes.",
    timestamp: "3j",
    source: "The Economist",
    imageUrl: "https://images.unsplash.com/photo-1623227413711-25ee4388dae3?q=80&w=1470&auto=format&fit=crop",
    url: "https://www.economist.com/finance-and-economics"
  },
];
