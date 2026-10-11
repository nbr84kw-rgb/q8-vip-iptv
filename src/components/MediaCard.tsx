import { Crown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MediaCard({
  name,
  icon,
  subtitle,
  onClick,
}: {
  name: string;
  icon?: string | null;
  subtitle?: string | null;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="group relative h-auto w-full flex-col items-stretch gap-0 overflow-hidden rounded-lg border border-border bg-card p-0 text-start transition-colors hover:border-gold hover:bg-card focus-visible:scale-[1.025] focus-visible:border-gold"
    >
      <div className="flex aspect-[2/3] items-center justify-center overflow-hidden bg-secondary">
        {icon ? (
          <img src={icon} alt={name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <Crown className="h-10 w-10 text-gold/60" />
        )}
      </div>
      <span className="absolute end-2 top-2 rounded-md bg-background/85 p-1.5 text-gold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Play className="h-4 w-4" />
      </span>
      <div className="min-w-0 p-2.5">
        <p className="truncate text-xs font-bold text-card-foreground">{name}</p>
        {subtitle ? <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{subtitle}</p> : null}
      </div>
    </Button>
  );
}
