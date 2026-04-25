import { useEffect, useState, useCallback } from "react";
import { listTransactions, Transaction } from "@/services/transactions";
import { supabase } from "@/integrations/supabase/client";

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await listTransactions();
      setData(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("transactions-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { data, loading, error, refresh };
}
