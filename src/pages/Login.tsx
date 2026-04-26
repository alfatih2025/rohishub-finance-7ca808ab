import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error("Email atau password salah");
      } else {
        toast.success("Berhasil masuk");
        navigate("/admin", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-md card-elevated p-8 animate-scale-in">
        <div className="flex flex-col items-center mb-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-lg mb-3">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold">Masuk Bendahara</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Akses terbatas — hanya akun bendahara resmi ROHIS Al-Hafidh.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-5">
          Pendaftaran akun baru dinonaktifkan. Hubungi pengurus jika butuh akses.
        </p>
        <div className="text-center mt-3">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Kembali ke laporan publik</Link>
        </div>
      </div>
    </div>
  );
}
