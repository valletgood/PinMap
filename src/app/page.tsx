import { AuthGuard } from "@/components/auth/AuthGuard";
import { MapView } from "@/components/map/MapView";

export default function Home() {
  return (
    <AuthGuard>
      <MapView />
    </AuthGuard>
  );
}
