import { useTransactions } from "@/hooks/useTransactions";
import { summarize, monthlySeries, expenseByCategory, summarizeEmergency } from "@/utils/analytics";
import StatCard from "@/components/StatCard";
import { formatRupiah, formatMonth } from "@/utils/format";
import { TrendingUp, TrendingDown, Wallet, ShieldCheck, AlertTriangle, AlertOctagon, LifeBuoy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(152 60% 40%)", "hsl(38 92% 50%)", "hsl(210 80% 55%)", "hsl(280 60% 55%)", "hsl(0 70% 55%)", "hsl(180 60% 40%)"];

export default function Dashboard() {
  const { data, loading } = useTransactions();
  const s = summarize(data);
  const em = summarizeEmergency(data);
  const series = monthlySeries(data).map(m => ({ ...m, label: formatMonth(m.month + "-01") }));
  const pie = expenseByCategory(data);

  const statusIcon = s.status === "Aman" ? <ShieldCheck className="h-4 w-4" /> : s.status === "Waspada" ? <AlertTriangle className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />;
  const statusTone: "success" | "warning" | "danger" | "default" = s.status === "Aman" ? "success" : s.status === "Waspada" ? "warning" : s.status === "Kritis" ? "danger" : "default";

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0,1,2].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-slow">
      <section className="card-elevated overflow-hidden relative hover-lift">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 islamic-pattern opacity-30" />
        <svg className="absolute -right-10 -top-10 h-64 w-64 text-primary-foreground/10 animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="50" cy="50" r="48" />
          <circle cx="50" cy="50" r="36" />
          <circle cx="50" cy="50" r="24" />
          <path d="M50 2 L50 98 M2 50 L98 50 M14.6 14.6 L85.4 85.4 M85.4 14.6 L14.6 85.4" />
          <path d="M50 10 L58 30 L78 30 L62 42 L68 62 L50 50 L32 62 L38 42 L22 30 L42 30 Z" />
        </svg>
        <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-primary-foreground/10 blur-2xl animate-glow-pulse" />
        <div className="relative p-8 md:p-10 text-primary-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="uppercase tracking-widest text-xs opacity-80">ROHIS Al-Hafidh · SMKN 1 Semarang</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Transparansi keuangan organisasi.</h1>
            <p className="opacity-90">Pantau pemasukan, pengeluaran, dan saldo kas ROHIS Al-Hafidh secara terbuka — kapan pun, di mana pun.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild className="transition-smooth hover:scale-105"><Link to="/laporan">Lihat Laporan</Link></Button>
            <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-smooth hover:scale-105" asChild>
              <Link to="/analisis">Analisis</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="card-elevated p-6 md:p-10 relative overflow-hidden hover-lift">
        <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />
        <svg className="absolute top-3 left-3 h-10 w-10 text-primary/30" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 20 Q2 2, 20 2" />
          <path d="M8 20 Q8 8, 20 8" />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        </svg>
        <svg className="absolute top-3 right-3 h-10 w-10 text-primary/30 rotate-90" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 20 Q2 2, 20 2" />
          <path d="M8 20 Q8 8, 20 8" />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-3 left-3 h-10 w-10 text-primary/30 -rotate-90" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 20 Q2 2, 20 2" />
          <path d="M8 20 Q8 8, 20 8" />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-3 right-3 h-10 w-10 text-primary/30 rotate-180" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 20 Q2 2, 20 2" />
          <path d="M8 20 Q8 8, 20 8" />
          <circle cx="20" cy="20" r="1.5" fill="currentColor" />
        </svg>

        <div className="relative space-y-5 text-center max-w-3xl mx-auto py-2">
          <div className="ornament-divider text-xs">
            <span className="font-serif text-lg">۞</span>
          </div>

          <p className="text-base md:text-lg text-foreground leading-loose italic px-2">
            "Allah akan memberi rahmat bagi hambanya yang mencari rizki yang halal dan menyedekahkan dengan kesengajaan, mendahulukan kebutuhan yang lebih penting, pada hari di mana ia dalam keadaan fakir dan memiliki hajat."
          </p>

          <p className="text-sm font-semibold text-primary tracking-wide">
            — HR. Ahmad dan Muslim
          </p>

          <div className="ornament-divider text-xs">
            <span className="font-serif text-lg">۞</span>
          </div>

          <p className="text-xs text-muted-foreground pt-1 max-w-xl mx-auto">
            Hadits ini menjadi pedoman ROHIS Al-Hafidh dalam mengelola amanah keuangan: mencari yang halal, menyedekahkan dengan niat tulus, dan mendahulukan yang lebih penting.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Pemasukan" value={formatRupiah(s.totalIn)} icon={<TrendingUp className="h-4 w-4" />} hint={`${data.filter(t=>t.type==='pemasukan' && t.category!=='Dana Darurat').length} transaksi`} />
        <StatCard title="Total Pengeluaran" value={formatRupiah(s.totalOut)} icon={<TrendingDown className="h-4 w-4" />} hint={`${data.filter(t=>t.type==='pengeluaran' && t.category!=='Dana Darurat').length} transaksi`} />
        <StatCard title="Saldo Kas" value={formatRupiah(s.balance)} icon={<Wallet className="h-4 w-4" />} hint={s.totalIn > 0 ? `${(s.ratio*100).toFixed(0)}% dari pemasukan tersisa` : '—'} />
        <StatCard title="Status Kas" value={s.status} icon={statusIcon} tone={statusTone} hint={s.insights[0] ?? '—'} />
      </section>

      <section className="card-elevated p-6 md:p-8 relative overflow-hidden hover-lift border-warning/30">
        <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-warning/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-warning/15 text-warning">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold text-lg">Dana Darurat</h3>
              <p className="text-xs text-muted-foreground">Terpisah dari saldo kas utama — disimpan untuk keperluan mendesak.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Pemasukan Dana Darurat" value={formatRupiah(em.totalIn)} icon={<TrendingUp className="h-4 w-4" />} hint={`${data.filter(t=>t.type==='pemasukan' && t.category==='Dana Darurat').length} transaksi`} />
            <StatCard title="Pengeluaran Dana Darurat" value={formatRupiah(em.totalOut)} icon={<TrendingDown className="h-4 w-4" />} hint={`${data.filter(t=>t.type==='pengeluaran' && t.category==='Dana Darurat').length} transaksi`} />
            <StatCard title="Saldo Dana Darurat" value={formatRupiah(em.balance)} icon={<LifeBuoy className="h-4 w-4" />} tone="warning" hint={em.count === 0 ? 'Belum ada catatan' : `${em.count} transaksi tercatat`} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-elevated p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tren Bulanan</h3>
            <span className="text-xs text-muted-foreground">Pemasukan vs Pengeluaran</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatRupiah(v)} />
                <Legend />
                <Line type="monotone" dataKey="pemasukan" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pengeluaran" stroke="hsl(var(--danger))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated p-5">
          <h3 className="font-semibold mb-4">Distribusi Pengeluaran</h3>
          <div className="h-72">
            {pie.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Belum ada pengeluaran.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={2}>
                    {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatRupiah(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="card-elevated p-5">
        <h3 className="font-semibold mb-4">Perbandingan Pemasukan vs Pengeluaran</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(v: number) => formatRupiah(v)} />
              <Legend />
              <Bar dataKey="pemasukan" fill="hsl(var(--success))" radius={[8,8,0,0]} />
              <Bar dataKey="pengeluaran" fill="hsl(var(--danger))" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
