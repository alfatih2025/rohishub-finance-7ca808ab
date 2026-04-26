import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction, deleteTransaction } from "@/services/transactions";
import TransactionTable from "@/components/TransactionTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet, LifeBuoy } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { summarize, summarizeEmergency, isEmergency } from "@/utils/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TransactionForm from "@/components/TransactionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const { data, loading, refresh } = useTransactions();
  const s = summarize(data);
  const em = summarizeEmergency(data);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

  const kasRows = useMemo(() => data.filter(t => !isEmergency(t)), [data]);
  const emergencyRows = useMemo(() => data.filter(isEmergency), [data]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTransaction(toDelete.id);
      toast.success("Transaksi dihapus");
      setToDelete(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-slow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard Bendahara</h1>
          <p className="text-muted-foreground">Kelola pemasukan & pengeluaran ROHIS — kas utama dan dana darurat dipisah.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Tambah Transaksi
        </Button>
      </div>

      <Tabs defaultValue="kas" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="kas"><Wallet className="h-4 w-4 mr-2" />Kas Utama</TabsTrigger>
          <TabsTrigger value="darurat"><LifeBuoy className="h-4 w-4 mr-2" />Dana Darurat</TabsTrigger>
        </TabsList>

        <TabsContent value="kas" className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard title="Total Pemasukan" value={formatRupiah(s.totalIn)} icon={<TrendingUp className="h-4 w-4" />} hint={`${kasRows.filter(t=>t.type==='pemasukan').length} transaksi`} />
            <StatCard title="Total Pengeluaran" value={formatRupiah(s.totalOut)} icon={<TrendingDown className="h-4 w-4" />} hint={`${kasRows.filter(t=>t.type==='pengeluaran').length} transaksi`} />
            <StatCard
              title="Saldo Kas"
              value={formatRupiah(s.balance)}
              icon={<Wallet className="h-4 w-4" />}
              tone={s.status === "Aman" ? "success" : s.status === "Waspada" ? "warning" : s.status === "Kritis" ? "danger" : "default"}
              hint={`Status: ${s.status}`}
            />
          </section>

          {loading ? <Skeleton className="h-80" /> : (
            <TransactionTable
              rows={kasRows}
              onEdit={(tx) => { setEditing(tx); setFormOpen(true); }}
              onDelete={(tx) => setToDelete(tx)}
            />
          )}
        </TabsContent>

        <TabsContent value="darurat" className="space-y-6">
          <div className="card-elevated p-5 border-warning/30 bg-warning/5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-warning/15 text-warning">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">Dana Darurat</h3>
                <p className="text-xs text-muted-foreground">Catatan terpisah untuk keperluan mendesak. Pilih kategori "Dana Darurat" saat menambah transaksi.</p>
              </div>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard title="Pemasukan Dana Darurat" value={formatRupiah(em.totalIn)} icon={<TrendingUp className="h-4 w-4" />} hint={`${emergencyRows.filter(t=>t.type==='pemasukan').length} transaksi`} />
            <StatCard title="Pengeluaran Dana Darurat" value={formatRupiah(em.totalOut)} icon={<TrendingDown className="h-4 w-4" />} hint={`${emergencyRows.filter(t=>t.type==='pengeluaran').length} transaksi`} />
            <StatCard
              title="Saldo Dana Darurat"
              value={formatRupiah(em.balance)}
              icon={<LifeBuoy className="h-4 w-4" />}
              tone="warning"
              hint={em.count === 0 ? 'Belum ada catatan' : `${em.count} transaksi tercatat`}
            />
          </section>

          {loading ? <Skeleton className="h-80" /> : (
            <TransactionTable
              rows={emergencyRows}
              onEdit={(tx) => { setEditing(tx); setFormOpen(true); }}
              onDelete={(tx) => setToDelete(tx)}
            />
          )}
        </TabsContent>
      </Tabs>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={() => refresh()}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data "{toDelete?.source}" akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-danger text-white hover:bg-danger/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
