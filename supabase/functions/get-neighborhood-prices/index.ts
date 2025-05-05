
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: "Adresse manquante" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Recherche de prix au mètre carré pour l'adresse: ${address}`);

    // Simulons des données pour ce POC
    // Dans une version réelle, on utiliserait une API comme MeilleursAgents, SeLoger ou des données gouvernementales
    const priceData = simulateNeighborhoodPrices(address);

    return new Response(
      JSON.stringify(priceData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur dans get-neighborhood-prices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fonction de simulation pour démontrer le concept
// Dans une vraie implémentation, on appellerait une API externe
function simulateNeighborhoodPrices(address: string) {
  // Extraction du code postal (si présent dans l'adresse)
  const postalCodeMatch = address.match(/\b\d{5}\b/);
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : null;
  
  // Déterminer la région en fonction du code postal
  let priceBase = 3000; // Prix par défaut
  let variation = 1000; // Variation par défaut
  
  if (postalCode) {
    const region = postalCode.substring(0, 2);
    
    // Ajustement des prix selon la région
    if (region === "75") { // Paris
      priceBase = 10000;
      variation = 3000;
    } else if (["77", "78", "91", "92", "93", "94", "95"].includes(region)) { // Île-de-France
      priceBase = 5000;
      variation = 2000;
    } else if (["06", "13", "33", "69"].includes(region)) { // Grandes villes (Nice, Marseille, Bordeaux, Lyon)
      priceBase = 4000;
      variation = 1500;
    }
  }
  
  // Générer des prix avec une légère variation aléatoire
  const averagePrice = priceBase + (Math.random() - 0.5) * variation;
  const minPrice = averagePrice - (Math.random() * variation * 0.4);
  const maxPrice = averagePrice + (Math.random() * variation * 0.4);
  
  return {
    averagePrice: Math.round(averagePrice),
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    source: "Simulation de données (démonstration)",
    lastUpdated: new Date().toISOString()
  };
}
