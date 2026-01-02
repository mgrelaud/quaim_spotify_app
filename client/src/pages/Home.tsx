import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Streamdown } from 'streamdown';

export default function Home() {
  let { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="p-8">
      {isAuthenticated ? (
        <h1>Bienvenue {user?.name} !</h1>
      ) : (
        <div>
          <h1>Vous n'êtes pas connecté</h1>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            Se connecter avec Spotify
          </Button>
        </div>
      )}
    </div>
  );
}