import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoRohis from "@/assets/logo-rohis.png";

const publicNav = [
  { to: "/", label: "Dashboard" },
  { to: "/laporan", label: "Laporan" },
  { to: "/analisis", label: "Analisis" },
  { to: "/tentang", label: "Tentang" },
];

export default function MainLayout() {
  const { user, isBendahara, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 font-semibold">
            <img src={logoRohis} alt="Logo ROHIS Al-Hafidh SMKN 1 Semarang" className="h-11 w-11 object-contain drop-shadow-sm" />
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-base">ROHIS Al-Hafidh</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">SMKN 1 Semarang · Finance</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {publicNav.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
            {isBendahara && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary-soft"
                  )
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Ganti tema">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Keluar
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/login"><LogIn className="h-4 w-4" /> Masuk</Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(o => !o)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t bg-card">
            <div className="container py-2 flex flex-col">
              {publicNav.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn("px-3 py-2 rounded-lg text-sm font-medium", isActive ? "bg-primary-soft text-primary" : "text-foreground")
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              {isBendahara && (
                <NavLink to="/admin" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-primary">
                  Admin
                </NavLink>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 container py-8 animate-fade-in">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ROHIS Al-Hafidh SMKN 1 Semarang — transparansi keuangan organisasi.
      </footer>
    </div>
  );
}
