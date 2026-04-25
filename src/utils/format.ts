export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export const formatMonth = (d: string | Date) =>
  new Date(d).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });

export const KATEGORI_PEMASUKAN = ["Iuran Anggota", "Donasi", "Sponsor", "Penjualan", "Lainnya"];
export const KATEGORI_PENGELUARAN = ["Konsumsi", "Perlengkapan", "Transportasi", "Honor Pemateri", "Dokumentasi", "Lainnya"];
