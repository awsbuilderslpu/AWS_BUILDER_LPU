"use client";

import * as React from "react";
import { ImageUpload } from "./ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert?: (path: string) => void;
  onImageUploaded?: (path: string) => void;
}

export function ImageDialog({
  open,
  onOpenChange,
  onInsert,
  onImageUploaded,
}: ImageDialogProps) {
  const [value, setValue] = React.useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setValue(null);
    }
    onOpenChange(nextOpen);
  };

  const handleUploaded = (path: string) => {
    onImageUploaded?.(path);
    onInsert?.(path);
    setValue(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Insert Image</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <ImageUpload
            id="dialog-image-upload"
            bucket="blog-images"
            value={value}
            onChange={setValue}
            onUploaded={handleUploaded}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

