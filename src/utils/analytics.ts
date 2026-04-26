import { Transaction } from "@/services/transactions";

export const EMERGENCY_CATEGORY = "Dana Darurat";

export const isEmergency = (t: Transaction) => t.category === EMERGENCY_CATEGORY;
export const splitEmergency = (txs: Transaction[]) => ({
  regular: txs.filter(t => !isEmergency(t)),
  emergency: txs.filter(t => isEmergency(t)),
});

export interface EmergencySummary {
  totalIn: number;
  totalOut: number;
  balance: number;
  count: number;
}

export function summarizeEmergency(txs: Transaction[]): EmergencySummary {
  const em = txs.filter(isEmergency);
  const totalIn = em.filter(t => t.type === "pemasukan").reduce((a, b) => a + Number(b.amount), 0);
  const totalOut = em.filter(t => t.type === "pengeluaran").reduce((a, b) => a + Number(b.amount), 0);
  return { totalIn, totalOut, balance: totalIn - totalOut, count: em.length };
}

export interface Summary {
  totalIn: number;
  totalOut: number;
  balance: number;
  ratio: number;
  status: "Aman" | "Waspada" | "Kritis" | "Belum ada data";
  topExpenseCategory: string | null;
  topExpenseAmount: number;
  monthlyTrendPct: number | null;
  insights: string[];
}

export function summarize(input: Transaction[]): Summary {
  const txs = input.filter(t => !isEmergency(t));
  const totalIn = txs.filter(t => t.type === "pemasukan").reduce((a, b) => a + Number(b.amount), 0);
  const totalOut = txs.filter(t => t.type === "pengeluaran").reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIn - totalOut;
  const ratio = totalIn > 0 ? balance / totalIn : 0;

  let status: Summary["status"] = "Belum ada data";
  if (totalIn > 0) {
    if (ratio > 0.5) status = "Aman";
    else if (ratio >= 0.2) status = "Waspada";
    else status = "Kritis";
  }

  // top expense category
  const byCat = new Map<string, number>();
  txs.filter(t => t.type === "pengeluaran").forEach(t => {
    byCat.set(t.category, (byCat.get(t.category) ?? 0) + Number(t.amount));
  });
  let topExpenseCategory: string | null = null;
  let topExpenseAmount = 0;
  byCat.forEach((v, k) => {
    if (v > topExpenseAmount) { topExpenseAmount = v; topExpenseCategory = k; }
  });

  // monthly trend (this month vs last month - pengeluaran)
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}`;
  const sumMonth = (m: string) =>
    txs.filter(t => t.type === "pengeluaran" && t.date.startsWith(m)).reduce((a, b) => a + Number(b.amount), 0);
  const cur = sumMonth(thisMonth);
  const prev = sumMonth(lastMonth);
  const monthlyTrendPct = prev > 0 ? ((cur - prev) / prev) * 100 : null;

  const insights: string[] = [];
  if (topExpenseCategory) {
    insights.push(`Pengeluaran terbesar ada di kategori ${topExpenseCategory}.`);
  }
  if (monthlyTrendPct !== null) {
    const arah = monthlyTrendPct >= 0 ? "meningkat" : "menurun";
    insights.push(`Pengeluaran bulan ini ${arah} ${Math.abs(monthlyTrendPct).toFixed(1)}% dibanding bulan lalu.`);
  }
  if (status === "Kritis") insights.push("Saldo tersisa di bawah 20% — pertimbangkan menahan pengeluaran tidak mendesak.");
  if (status === "Aman" && totalIn > 0) insights.push("Kondisi kas dalam batas aman, lebih dari 50% pemasukan masih tersisa.");

  return { totalIn, totalOut, balance, ratio, status, topExpenseCategory, topExpenseAmount, monthlyTrendPct, insights };
}

export function monthlySeries(txs: Transaction[]) {
  const map = new Map<string, { month: string; pemasukan: number; pengeluaran: number }>();
  txs.forEach(t => {
    const key = t.date.slice(0, 7);
    const e = map.get(key) ?? { month: key, pemasukan: 0, pengeluaran: 0 };
    if (t.type === "pemasukan") e.pemasukan += Number(t.amount);
    else e.pengeluaran += Number(t.amount);
    map.set(key, e);
  });
  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function expenseByCategory(txs: Transaction[]) {
  const map = new Map<string, number>();
  txs.filter(t => t.type === "pengeluaran").forEach(t => {
    map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}
