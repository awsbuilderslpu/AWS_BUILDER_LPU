"use client";

import * as React from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/data/admin";
import { notify } from "@/lib/admin/notify";
import { toCsv, downloadCsv, type CsvColumn } from "@/lib/admin/csv";
import { cn } from "@/lib/utils";

export interface ExportButtonProps<T> {
  filename: string;
  columns: CsvColumn<T>[];
  getRows: () => Promise<T[]> | T[];
  disabled?: boolean;
  className?: string;
}

export function ExportButton<T>({
  filename,
  columns,
  getRows,
  disabled = false,
  className,
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (exporting || disabled) return;
    setExporting(true);
    try {
      const rows = await getRows();
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const localDate = `${yyyy}-${mm}-${dd}`;
      const csvData = toCsv(rows, columns);
      downloadCsv(`${filename}-${localDate}`, csvData);
      notify.success(adminCopy.kit.exportDone(rows.length));
    } catch {
      notify.error(adminCopy.kit.exportFailed);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={disabled || exporting}
      className={cn("h-11 px-5 cursor-pointer font-medium", className)}
    >
      {exporting ? (
        <>
          <LoaderCircle className="size-4 animate-spin shrink-0" aria-hidden="true" />
          <span>{adminCopy.kit.exporting}</span>
        </>
      ) : (
        <>
          <Download className="size-4 shrink-0" aria-hidden="true" />
          <span>{adminCopy.kit.export}</span>
        </>
      )}
    </Button>
  );
}

