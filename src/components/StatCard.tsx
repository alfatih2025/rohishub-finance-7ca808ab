import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "success" | "danger" | "warning";
  className?: string;
}

const toneMap = {
  default: "bg-card",
  success: "bg-card border-success/30",
  danger: "bg-card border-danger/30",
  warning: "bg-card border-warning/30",
};

export default function StatCard({ title, value, icon, hint, tone = "default", className }: Props) {
  return (
    <div className={cn("card-elevated p-5 flex flex-col gap-3 animate-scale-in", toneMap[tone], className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">{icon}</span>}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
