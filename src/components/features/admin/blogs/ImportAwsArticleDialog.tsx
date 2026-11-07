"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FaAws } from "react-icons/fa6";
import { Loader2, ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/TextField";
import { notify } from "@/lib/admin/notify";
import { importAwsBuilderArticleAction } from "@/lib/blogs/aws-builder-sync";

export interface ImportAwsArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportAwsArticleDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportAwsArticleDialogProps) {
  const router = useRouter();
  const [url, setUrl] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      notify.error("Please enter an AWS Builder article URL");
      return;
    }

    if (!trimmed.toLowerCase().includes("builder.aws.com/content/")) {
      notify.error(
        "Please enter a valid AWS Builder article URL (https://builder.aws.com/content/...)"
      );
      return;
    }

    setIsImporting(true);
    try {
      const res = await importAwsBuilderArticleAction(trimmed);
      if (res.ok) {
        notify.success(`Imported: "${res.title}"`);
        setUrl("");
        onOpenChange(false);
        onSuccess?.();
        router.refresh();
      } else {
        notify.error(res.error || "Failed to import article");
      }
    } catch {
      notify.error("An unexpected error occurred while importing");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/80 bg-card/95 backdrop-blur-md">
        <form onSubmit={handleImport}>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex size-7 items-center justify-center rounded-md bg-[#FF9900] text-black">
                <FaAws className="size-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-white">
                Import from AWS Builder
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Paste the public link of your published article on{" "}
              <code className="text-primary font-mono text-[11px]">
                builder.aws.com
              </code>
              . We will automatically extract the title, summary, tags, publication
              date, and cover banner.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <TextField
              label="AWS Builder Article URL"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUrl(e.target.value)
              }
              placeholder="https://builder.aws.com/content/3Kq.../article-title"
              disabled={isImporting}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Tip: Go to your profile at{" "}
              <span className="text-foreground">builder.aws.com/profile</span>,
              open your article, and copy the browser URL.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isImporting || !url.trim()}
              className="gap-1.5 bg-[#FF9900] text-black hover:bg-[#FF9900]/90 font-medium"
            >
              {isImporting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span>Import Article</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

