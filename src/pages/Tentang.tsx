import { ShieldCheck, Eye, Lock, BarChart3 } from "lucide-react";

const fitur = [
  { icon: Eye, title: "Transparansi Penuh", desc: "Semua transaksi dapat dilihat publik tanpa perlu login." },
  { icon: Lock, title: "Akses Terbatas", desc: "Hanya bendahara terverifikasi yang dapat menambah/mengubah data." },
  { icon: BarChart3, title: "Visualisasi Data", desc: "Grafik tren bulanan, distribusi kategori, dan analisis saldo." },
  { icon: ShieldCheck, title: "Indikator Sehat Kas", desc: "Status Aman/Waspada/Kritis berdasarkan rasio saldo." },
];

export default function Tentang() {
  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold">Tentang Sistem</h1>
        <p className="text-muted-foreground mt-1">ROHIS Finance Manager — alat pencatatan keuangan organisasi yang sederhana dan transparan.</p>
      </header>

      <section className="card-elevated p-6 leading-relaxed">
        <p>
          Aplikasi ini dirancang khusus untuk membantu organisasi <b>ROHIS</b> dalam mengelola pemasukan dan pengeluaran kas
          secara terbuka kepada anggota dan publik. Bendahara mencatat seluruh transaksi beserta bukti, sementara
          siapa pun dapat memantau saldo dan riwayat keuangan secara real-time.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {fitur.map((f, i) => (
          <div key={i} className="card-elevated p-5 flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <f.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="card-elevated p-6">
        <h2 className="font-semibold mb-3">Bagaimana cara menggunakan?</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
          <li>Bendahara mendaftar akun pada halaman <b>Masuk</b>. Akun pertama otomatis menjadi bendahara.</li>
          <li>Masuk ke menu <b>Admin</b> untuk menambahkan transaksi pemasukan/pengeluaran beserta bukti.</li>
          <li>Anggota & publik melihat <b>Laporan</b> dan <b>Analisis</b> tanpa perlu login.</li>
        </ol>
      </section>
    </div>
  );
}
