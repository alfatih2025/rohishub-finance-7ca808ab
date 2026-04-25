import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "bendahara") {
    return (
      <div className="card-elevated p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Akses ditolak</h2>
        <p className="text-muted-foreground">Halaman ini hanya untuk bendahara.</p>
      </div>
    );
  }
  return <>{children}</>;
}
