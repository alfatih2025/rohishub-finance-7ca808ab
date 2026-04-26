import { useTransactions } from "@/hooks/useTransactions";
import { summarize, monthlySeries, expenseByCategory } from "@/utils/analytics";
import StatCard from "@/components/StatCard";
import { formatRupiah, formatMonth } from "@/utils/format";
import { TrendingUp, TrendingDown, Wallet, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(152 60% 40%)", "hsl(38 92% 50%)", "hsl(210 80% 55%)", "hsl(280 60% 55%)", "hsl(0 70% 55%)", "hsl(180 60% 40%)"];

export default function Dashboard() {
  const { data, loading } = useTransactions();
  const s = summarize(data);
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
    <div className="space-y-8">
      <section className="card-elevated overflow-hidden relative">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="relative p-8 md:p-10 text-primary-foreground flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="uppercase tracking-widest text-xs opacity-80">ROHIS Al-Hafidh · SMKN 1 Semarang</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Transparansi keuangan organisasi.</h1>
            <p className="opacity-90">Pantau pemasukan, pengeluaran, dan saldo kas ROHIS Al-Hafidh secara terbuka — kapan pun, di mana pun.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild><Link to="/laporan">Lihat Laporan</Link></Button>
            <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link to="/analisis">Analisis</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="card-elevated p-6 md:p-8 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="text-primary text-4xl leading-none font-serif">“</div>
          <div className="space-y-3">
            <p className="text-lg md:text-2xl font-medium leading-loose text-foreground" dir="rtl" lang="ar">
              وَلَا تَجْعَلْ يَدَكَ مَغْلُولَةً إِلَىٰ عُنُقِكَ وَلَا تَبْسُطْهَا كُلَّ الْبَسْطِ فَتَقْعُدَ مَلُومًا مَحْسُورًا
            </p>
            <p className="text-base text-muted-foreground italic">
              "Dan janganlah engkau jadikan tanganmu terbelenggu pada lehermu, dan jangan pula engkau terlalu mengulurkannya, karena itu engkau menjadi tercela dan menyesal."
            </p>
            <p className="text-sm font-semibold text-primary">— QS. Al-Isra' (17): 29</p>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Ayat ini menjadi pedoman ROHIS Al-Hafidh dalam mengelola amanah keuangan: tidak kikir, tidak boros, dan selalu seimbang.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Pemasukan" value={formatRupiah(s.totalIn)} icon={<TrendingUp className="h-4 w-4" />} hint={`${data.filter(t=>t.type==='pemasukan').length} transaksi`} />
        <StatCard title="Total Pengeluaran" value={formatRupiah(s.totalOut)} icon={<TrendingDown className="h-4 w-4" />} hint={`${data.filter(t=>t.type==='pengeluaran').length} transaksi`} />
        <StatCard title="Saldo Kas" value={formatRupiah(s.balance)} icon={<Wallet className="h-4 w-4" />} hint={s.totalIn > 0 ? `${(s.ratio*100).toFixed(0)}% dari pemasukan tersisa` : '—'} />
        <StatCard title="Status Kas" value={s.status} icon={statusIcon} tone={statusTone} hint={s.insights[0] ?? '—'} />
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
