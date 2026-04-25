import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionTable from "@/components/TransactionTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowUpDown } from "lucide-react";
import { KATEGORI_PEMASUKAN, KATEGORI_PENGELUARAN, formatRupiah } from "@/utils/format";
import { summarize } from "@/utils/analytics";

const PAGE_SIZE = 10;

export default function Laporan() {
  const { data, loading } = useTransactions();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");
  const [cat, setCat] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const allCats = Array.from(new Set([...KATEGORI_PEMASUKAN, ...KATEGORI_PENGELUARAN, ...data.map(d => d.category)]));

  const filtered = useMemo(() => {
    let rows = [...data];
    if (type !== "all") rows = rows.filter(r => r.type === type);
    if (cat !== "all") rows = rows.filter(r => r.category === cat);
    if (from) rows = rows.filter(r => r.date >= from);
    if (to) rows = rows.filter(r => r.date <= to);
    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter(r => r.source.toLowerCase().includes(s) || (r.notes ?? "").toLowerCase().includes(s) || r.category.toLowerCase().includes(s));
    }
    rows.sort((a, b) => {
      const v = sortBy === "date" ? a.date.localeCompare(b.date) : Number(a.amount) - Number(b.amount);
      return sortDir === "asc" ? v : -v;
    });
    return rows;
  }, [data, q, type, cat, from, to, sortBy, sortDir]);

  const s = summarize(filtered);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">Laporan Keuangan</h1>
        <p className="text-muted-foreground">Semua transaksi tercatat — terbuka untuk publik.</p>
      </header>

      <div className="card-elevated p-4 grid gap-3 md:grid-cols-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Cari sumber/keperluan/kategori..." className="pl-9" />
        </div>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Jenis" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="pemasukan">Pemasukan</SelectItem>
            <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {allCats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
        <Input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />

        <div className="md:col-span-6 flex flex-wrap items-center gap-2 justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Urutkan:</span>
            <Button variant={sortBy === "date" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("date")}>Tanggal</Button>
            <Button variant={sortBy === "amount" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("amount")}>Nominal</Button>
            <Button variant="ghost" size="sm" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
              <ArrowUpDown className="h-4 w-4" /> {sortDir === "asc" ? "Naik" : "Turun"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>Pemasukan: <b className="text-success">{formatRupiah(s.totalIn)}</b></span>
            <span>Pengeluaran: <b className="text-danger">{formatRupiah(s.totalOut)}</b></span>
            <span>Saldo: <b className="text-primary">{formatRupiah(s.balance)}</b></span>
          </div>
        </div>
      </div>

      <TransactionTable rows={pageRows} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Sebelumnya</Button>
          <span className="text-sm text-muted-foreground">Halaman {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Berikutnya</Button>
        </div>
      )}
    </div>
  );
}
