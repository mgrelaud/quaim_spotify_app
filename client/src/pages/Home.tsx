import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Music2 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Music2 className="h-10 w-10 text-primary" />
      </div>
      
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        Quai M Spotify Matcher
      </h1>
      
      <p className="mb-8 max-w-[600px] text-lg text-muted-foreground">
        Comparez vos goûts musicaux avec vos amis, découvrez vos artistes communs 
         et créez la playlist parfaite pour votre prochain passage au Quai M.
      </p>

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">Connecté en tant que {user?.name}</p>
          <Button size="lg" onClick={() => window.location.href = "/match"}>
            Commencer un Match
          </Button>
        </div>
      ) : (
        <Button 
          size="lg" 
          className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
          onClick={() => window.location.href = getLoginUrl()}
        >
          Se connecter avec Spotify
        </Button>
      )}
    </div>
  );
}
