import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction, deleteTransaction } from "@/services/transactions";
import TransactionTable from "@/components/TransactionTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import { summarize } from "@/utils/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TransactionForm from "@/components/TransactionForm";

export default function Admin() {
  const { data, loading, refresh } = useTransactions();
  const s = summarize(data);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard Bendahara</h1>
          <p className="text-muted-foreground">Kelola pemasukan & pengeluaran ROHIS.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Tambah Transaksi
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Pemasukan" value={formatRupiah(s.totalIn)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard title="Total Pengeluaran" value={formatRupiah(s.totalOut)} icon={<TrendingDown className="h-4 w-4" />} />
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
          rows={data}
          onEdit={(tx) => { setEditing(tx); setFormOpen(true); }}
          onDelete={(tx) => setToDelete(tx)}
        />
      )}

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
