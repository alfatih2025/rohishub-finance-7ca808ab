import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Transaction, createTransaction, updateTransaction, uploadProof } from "@/services/transactions";
import { KATEGORI_PEMASUKAN, KATEGORI_PENGELUARAN } from "@/utils/format";
import { Loader2, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Transaction | null;
  onSaved: () => void;
}

export default function TransactionForm({ open, onOpenChange, editing, onSaved }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [date, setDate] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setType(editing.type);
        setDate(editing.date);
        setSource(editing.source);
        setCategory(editing.category);
        setAmount(String(editing.amount));
        setNotes(editing.notes ?? "");
        setProofUrl(editing.proof_url);
      } else {
        setType("pemasukan");
        setDate(new Date().toISOString().slice(0, 10));
        setSource(""); setCategory(""); setAmount(""); setNotes("");
        setProofUrl(null);
      }
      setFile(null);
    }
  }, [open, editing]);

  const categories = type === "pemasukan" ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = Number(amount);
    if (!date || !source.trim() || !category || isNaN(amt) || amt <= 0) {
      toast.error("Lengkapi semua field dengan benar");
      return;
    }
    setSaving(true);
    try {
      let url = proofUrl;
      if (file) {
        url = await uploadProof(file, user.id);
      }
      const payload = { type, date, source: source.trim(), category, amount: amt, notes: notes.trim() || null, proof_url: url };
      if (editing) {
        await updateTransaction(editing.id, payload);
        toast.success("Transaksi diperbarui");
      } else {
        await createTransaction(payload, user.id);
        toast.success("Transaksi ditambahkan");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
          <DialogDescription>Catat pemasukan atau pengeluaran kas ROHIS.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={type} onValueChange={(v) => { setType(v as "pemasukan" | "pengeluaran"); setCategory(""); }}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="pemasukan">Pemasukan</TabsTrigger>
              <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Nominal (Rp) *</Label>
              <Input id="amount" type="number" min="0" step="100" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">{type === "pemasukan" ? "Sumber Pemasukan *" : "Keperluan *"}</Label>
            <Input id="source" value={source} onChange={e => setSource(e.target.value)} required maxLength={150} placeholder={type === "pemasukan" ? "Contoh: Iuran kas mingguan" : "Contoh: Konsumsi kajian Jumat"} />
          </div>

          <div className="space-y-2">
            <Label>Kategori *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Keterangan</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} maxLength={500} placeholder="Detail tambahan (opsional)" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Bukti Transaksi</Label>
            <div className="flex items-center gap-2">
              <Input id="file" type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </div>
            {file && <p className="text-xs text-muted-foreground flex items-center gap-1"><Upload className="h-3 w-3" /> {file.name}</p>}
            {!file && proofUrl && (
              <a href={proofUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Bukti tersimpan saat ini ↗</a>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
