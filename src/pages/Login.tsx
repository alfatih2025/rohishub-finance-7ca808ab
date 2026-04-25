import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) toast.error(error);
        else { toast.success("Berhasil masuk"); navigate("/admin"); }
      } else {
        if (password.length < 6) { toast.error("Password minimal 6 karakter"); return; }
        const { error } = await signUp(email, password, fullName);
        if (error) toast.error(error);
        else { toast.success("Akun dibuat. Silakan masuk."); setMode("signin"); }
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-md card-elevated p-8 animate-scale-in">
        <div className="flex flex-col items-center mb-6">
          <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-lg mb-3">
            <Wallet className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold">{mode === "signin" ? "Masuk Bendahara" : "Buat Akun"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Akses dashboard pengelolaan kas" : "Akun pertama otomatis menjadi bendahara"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : mode === "signin" ? "Masuk" : "Daftar"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-5">
          {mode === "signin" ? (
            <>Belum punya akun? <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Daftar</button></>
          ) : (
            <>Sudah punya akun? <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Masuk</button></>
          )}
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Kembali ke laporan publik</Link>
        </div>
      </div>
    </div>
  );
}
