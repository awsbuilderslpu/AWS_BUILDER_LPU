import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export interface UserCellProps {
  name: string;
  secondary?: string;
  src?: string;
  className?: string;
}

export function UserCell({ name, secondary, src, className }: UserCellProps) {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <Avatar name={name} src={src} size={36} className="shrink-0" />
      <div className="flex flex-col justify-center min-w-0">
        <span className="text-[14.5px] font-medium text-white truncate leading-snug">
          {name}
        </span>
        {secondary && (
          <span className="text-[12.5px] text-muted-foreground truncate leading-tight">
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
}

