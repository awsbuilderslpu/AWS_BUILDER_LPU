"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { TextField, type TextFieldProps } from "@/components/ui/TextField";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "rightSlot">;

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <TextField
      ref={ref}
      type={showPassword ? "text" : "password"}
      rightSlot={
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      }
      {...props}
    />
  );
});
PasswordField.displayName = "PasswordField";
