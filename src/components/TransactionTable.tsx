import { Transaction } from "@/services/transactions";
import { formatRupiah, formatDate } from "@/utils/format";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  rows: Transaction[];
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}

export default function TransactionTable({ rows, onEdit, onDelete }: Props) {
  if (!rows.length) {
    return (
      <div className="card-elevated p-10 text-center text-muted-foreground">
        Belum ada transaksi yang sesuai.
      </div>
    );
  }
  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Jenis</th>
              <th className="px-4 py-3 text-left">Sumber / Keperluan</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-right">Nominal</th>
              <th className="px-4 py-3 text-left">Bukti</th>
              {(onEdit || onDelete) && <th className="px-4 py-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map(t => {
              const isIn = t.type === "pemasukan";
              return (
                <tr key={t.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn(
                      "gap-1",
                      isIn ? "border-success/40 text-success" : "border-danger/40 text-danger"
                    )}>
                      {isIn ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {isIn ? "Masuk" : "Keluar"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-medium truncate">{t.source}</div>
                    {t.notes && <div className="text-xs text-muted-foreground truncate">{t.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                  <td className={cn("px-4 py-3 text-right font-semibold whitespace-nowrap", isIn ? "text-success" : "text-danger")}>
                    {isIn ? "+" : "−"} {formatRupiah(Number(t.amount))}
                  </td>
                  <td className="px-4 py-3">
                    {t.proof_url ? (
                      <a href={t.proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                        <FileImage className="h-4 w-4" /> Lihat
                      </a>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        {onEdit && (
                          <Button size="icon" variant="ghost" onClick={() => onEdit(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button size="icon" variant="ghost" className="text-danger hover:text-danger" onClick={() => onDelete(t)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
