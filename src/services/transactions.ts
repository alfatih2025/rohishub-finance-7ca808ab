import { supabase } from "@/integrations/supabase/client";

export type TxType = "pemasukan" | "pengeluaran";

export interface Transaction {
  id: string;
  type: TxType;
  date: string;
  source: string;
  category: string;
  amount: number;
  notes: string | null;
  proof_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type NewTransaction = Omit<Transaction, "id" | "created_at" | "updated_at" | "created_by">;

export async function listTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function createTransaction(tx: NewTransaction, userId: string) {
  const { error } = await supabase.from("transactions").insert({ ...tx, created_by: userId });
  if (error) throw error;
}

export async function updateTransaction(id: string, tx: Partial<NewTransaction>) {
  const { error } = await supabase.from("transactions").update(tx).eq("id", id);
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProof(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("proofs").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("proofs").getPublicUrl(path);
  return data.publicUrl;
}
