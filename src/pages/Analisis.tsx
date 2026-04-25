import { useTransactions } from "@/hooks/useTransactions";
import { summarize, expenseByCategory, monthlySeries } from "@/utils/analytics";
import StatCard from "@/components/StatCard";
import { formatRupiah, formatMonth } from "@/utils/format";
import { Lightbulb, TrendingDown, TrendingUp, Wallet, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Analisis() {
  const { data, loading } = useTransactions();
  const s = summarize(data);
  const byCat = expenseByCategory(data).sort((a, b) => b.value - a.value);
  const series = monthlySeries(data).map(m => ({ ...m, label: formatMonth(m.month + "-01"), saldo: m.pemasukan - m.pengeluaran }));

  if (loading) return <Skeleton className="h-96" />;

  const StatusIcon = s.status === "Aman" ? ShieldCheck : s.status === "Waspada" ? AlertTriangle : AlertOctagon;
  const statusColor = s.status === "Aman" ? "text-success" : s.status === "Waspada" ? "text-warning" : "text-danger";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">Analisis Keuangan</h1>
        <p className="text-muted-foreground">Insight otomatis berdasarkan data transaksi.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Pemasukan" value={formatRupiah(s.totalIn)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard title="Total Pengeluaran" value={formatRupiah(s.totalOut)} icon={<TrendingDown className="h-4 w-4" />} />
        <StatCard title="Saldo Akhir" value={formatRupiah(s.balance)} icon={<Wallet className="h-4 w-4" />} />
        <StatCard
          title="Status Kas"
          value={s.status}
          tone={s.status === "Aman" ? "success" : s.status === "Waspada" ? "warning" : s.status === "Kritis" ? "danger" : "default"}
          icon={<StatusIcon className="h-4 w-4" />}
          hint={s.totalIn > 0 ? `${(s.ratio * 100).toFixed(1)}% dari pemasukan tersisa` : "Belum ada pemasukan"}
        />
      </section>

      <section className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={cn("grid h-10 w-10 place-items-center rounded-xl bg-primary-soft", statusColor)}>
            <Lightbulb className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-lg">Insight Otomatis</h2>
            <p className="text-sm text-muted-foreground">Diperbarui mengikuti data terbaru.</p>
          </div>
        </div>
        {s.insights.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada cukup data untuk menghasilkan insight.</p>
        ) : (
          <ul className="space-y-2">
            {s.insights.map((it, i) => (
              <li key={i} className="flex gap-3 p-3 rounded-lg bg-muted/40 text-sm">
                <span className="text-primary">•</span>{it}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-5">
          <h3 className="font-semibold mb-4">Pengeluaran per Kategori</h3>
          <div className="h-72">
            {byCat.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Belum ada pengeluaran.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCat} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {byCat.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card-elevated p-5">
          <h3 className="font-semibold mb-4">Saldo per Bulan</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatRupiah(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="saldo" radius={[8, 8, 0, 0]}>
                  {series.map((d, i) => <Cell key={i} fill={d.saldo >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
