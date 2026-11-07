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
      <DialogContent className="sm:max-w-xl border-border/80 bg-card/95 backdrop-blur-md p-6 sm:p-7">
        <form onSubmit={handleImport} className="space-y-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-[#FF9900] text-black shadow-sm">
                <FaAws className="size-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-white">
                Import from AWS Builder
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Paste the public link of your published article on{" "}
              <code className="text-primary font-mono text-xs">
                builder.aws.com
              </code>
              . We will automatically extract the title, summary, tags, publication
              date, and cover banner.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2.5">
            <TextField
              label="AWS Builder Article URL"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUrl(e.target.value)
              }
              placeholder="https://builder.aws.com/content/3Kq.../article-title"
              disabled={isImporting}
              required
              className="h-11 text-sm placeholder:text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Go to your profile at{" "}
              <span className="text-foreground">builder.aws.com/profile</span>,
              open your article, and copy the browser URL.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
              className="h-10 px-5 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="default"
              disabled={isImporting || !url.trim()}
              className="h-10 px-5 gap-2 bg-[#FF9900] text-black hover:bg-[#FF9900]/90 font-medium text-sm"
            >
              {isImporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span>Import Article</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

