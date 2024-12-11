import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Portfolio Tracker</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour accéder à votre portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Mot de passe"
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;