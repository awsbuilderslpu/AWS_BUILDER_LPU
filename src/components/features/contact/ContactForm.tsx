"use client";

import * as React from "react";
import { ChevronDown, Loader2, Check, UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { FormField } from "@/components/ui/FormField";
import { fieldClass } from "@/components/ui/formStyles";
import { Button } from "@/components/ui/button";
import { contactCopy, formSubjects, messageLimits } from "@/data/contact";
import { siteConfig } from "@/data/site";
import {
  type ContactField,
  type ContactValues,
  type ContactErrors,
  validateField,
  validateContact,
  submitContact,
  validateResumeFile,
} from "@/lib/contact";

const initialValues: ContactValues = {
  name: "",
  email: "",
  phone: "",
  registrationNumber: "",
  university: siteConfig.university,
  subject: "",
  message: "",
};

export function ContactForm() {
  const [values, setValues] = React.useState<ContactValues>(initialValues);
  const [errors, setErrors] = React.useState<ContactErrors>({});
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [resumeError, setResumeError] = React.useState<string | undefined>(
    undefined
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState<
    "idle" | "submitting" | "success" | "failed"
  >("idle");

  const successHeadingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (status === "success") {
      successHeadingRef.current?.focus();
    }
  }, [status]);

  const handleChange = (field: ContactField, value: string) => {
    const updatedValues = { ...values, [field]: value };
    setValues(updatedValues);

    if (errors[field]) {
      const fieldError = validateField(field, updatedValues);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldError) {
          next[field] = fieldError;
        } else {
          delete next[field];
        }
        return next;
      });
    }

    if (status === "failed") {
      setStatus("idle");
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setResumeFile(null);
      setResumeError(undefined);
      return;
    }

    const error = validateResumeFile(file);
    if (error) {
      setResumeError(error);
      setResumeFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setResumeError(undefined);
      setResumeFile(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeFile(null);
    setResumeError(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const validationErrors = validateContact(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const fieldOrder: ContactField[] = [
        "name",
        "email",
        "phone",
        "registrationNumber",
        "university",
        "subject",
        "message",
      ];
      const firstInvalid = fieldOrder.find((f) => validationErrors[f]);
      if (firstInvalid) {
        document.getElementById(`contact-${firstInvalid}`)?.focus();
      }
      return;
    }

    if (resumeError) {
      document.getElementById("contact-resume-dropzone")?.focus();
      return;
    }

    setStatus("submitting");
    const result = await submitContact(values, resumeFile);
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setResumeFile(null);
    setResumeError(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStatus("idle");
    setTimeout(() => {
      document.getElementById("contact-name")?.focus();
    }, 0);
  };

  return (
    <section
      aria-labelledby="contact-form-title"
      className="rounded-lg border border-border bg-card/60 p-6 sm:p-8"
    >
      <SectionEyebrow
        id="contact-form-title"
        size="sm"
        lines="after"
        role="heading"
        aria-level={2}
      >
        {contactCopy.titles.form}
      </SectionEyebrow>

      {status === "success" ? (
        <div
          role="status"
          className="flex flex-col items-center gap-4 py-10 text-center"
        >
          <div
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full border border-success/50 bg-success/10"
          >
            <Check className="size-7 text-success" />
          </div>

          <h3
            ref={successHeadingRef}
            tabIndex={-1}
            className="text-[22px] font-semibold text-foreground outline-none"
          >
            {contactCopy.successTitle}
          </h3>

          <p className="max-w-[360px] text-[15px] leading-relaxed text-muted-foreground">
            {contactCopy.successText}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="mt-2"
          >
            {contactCopy.successAgain}
          </Button>
        </div>
      ) : (
        <form
          noValidate
          aria-busy={status === "submitting"}
          onSubmit={handleSubmit}
          className="mt-6 grid gap-5"
        >
          {/* Row 1: Name and Email */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="contact-name"
              label={contactCopy.fields.name.label}
              required
              error={errors.name}
            >
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={contactCopy.fields.name.placeholder}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={cn(fieldClass, "h-11")}
              />
            </FormField>

            <FormField
              id="contact-email"
              label={contactCopy.fields.email.label}
              required
              error={errors.email}
            >
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={contactCopy.fields.email.placeholder}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                className={cn(fieldClass, "h-11")}
              />
            </FormField>
          </div>

          {/* Row 2: Phone Number and Registration Number */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="contact-phone"
              label={contactCopy.fields.phone.label}
              required
              error={errors.phone}
            >
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={values.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder={contactCopy.fields.phone.placeholder}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "contact-phone-error" : undefined}
                className={cn(fieldClass, "h-11")}
              />
            </FormField>

            <FormField
              id="contact-registrationNumber"
              label={contactCopy.fields.registrationNumber.label}
              required
              error={errors.registrationNumber}
            >
              <input
                id="contact-registrationNumber"
                name="registrationNumber"
                type="text"
                autoComplete="off"
                value={values.registrationNumber}
                onChange={(e) =>
                  handleChange("registrationNumber", e.target.value)
                }
                placeholder={contactCopy.fields.registrationNumber.placeholder}
                aria-invalid={Boolean(errors.registrationNumber)}
                aria-describedby={
                  errors.registrationNumber
                    ? "contact-registrationNumber-error"
                    : undefined
                }
                className={cn(fieldClass, "h-11")}
              />
            </FormField>
          </div>

          {/* Row 3: University and Topic */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="contact-university"
              label={contactCopy.fields.university.label}
              required
              error={errors.university}
            >
              <input
                id="contact-university"
                name="university"
                type="text"
                autoComplete="organization"
                value={values.university}
                onChange={(e) => handleChange("university", e.target.value)}
                placeholder={contactCopy.fields.university.placeholder}
                aria-invalid={Boolean(errors.university)}
                aria-describedby={
                  errors.university ? "contact-university-error" : undefined
                }
                className={cn(fieldClass, "h-11")}
              />
            </FormField>

            <FormField
              id="contact-subject"
              label={contactCopy.fields.subject.label}
              required
              error={errors.subject}
            >
              <div className="relative">
                <select
                  id="contact-subject"
                  name="subject"
                  value={values.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={
                    errors.subject ? "contact-subject-error" : undefined
                  }
                  className={cn(
                    fieldClass,
                    "h-11 appearance-none pr-10 [color-scheme:dark] cursor-pointer",
                    values.subject === ""
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  <option value="" disabled>
                    {contactCopy.fields.subject.placeholder}
                  </option>
                  {formSubjects.map((sub) => (
                    <option
                      key={sub}
                      value={sub}
                      className="bg-card text-foreground"
                    >
                      {sub}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </FormField>
          </div>

          {/* Row 4: Resume / CV Upload */}
          <FormField
            id="contact-resume"
            label={contactCopy.fields.resume.label}
            error={resumeError}
          >
            <input
              ref={fileInputRef}
              id="contact-resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                handleFileChange(file);
              }}
            />

            {resumeFile ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-card/80 p-3.5 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-medium text-foreground">
                      {resumeFile.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatFileSize(resumeFile.size)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  aria-label="Remove resume"
                  className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div
                id="contact-resume-dropzone"
                tabIndex={0}
                role="button"
                aria-label="Upload resume"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0] || null;
                  handleFileChange(file);
                }}
                className={cn(
                  "group flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all cursor-pointer select-none",
                  isDragging
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(255,153,0,0.15)]"
                    : "border-border bg-card/40 hover:border-primary/50 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted/60 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div className="mt-2.5 text-sm font-medium text-foreground">
                  <span className="text-primary hover:underline">Click to upload</span>{" "}
                  or drag and drop your resume
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {contactCopy.fields.resume.hint}
                </p>
              </div>
            )}
          </FormField>

          {/* Message */}
          <FormField
            id="contact-message"
            label={contactCopy.fields.message.label}
            required
            error={errors.message}
          >
            <div>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                maxLength={messageLimits.max}
                value={values.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder={contactCopy.fields.message.placeholder}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message ? "contact-message-error" : undefined
                }
                className={cn(fieldClass, "min-h-[150px] resize-y py-3")}
              />
              <div className="mt-1 flex justify-end">
                <span
                  aria-hidden="true"
                  className="font-mono text-[12.5px] tabular-nums text-muted-foreground"
                >
                  {values.message.length}/{messageLimits.max}
                </span>
              </div>
            </div>
          </FormField>

          {/* Failure banner */}
          {status === "failed" && (
            <div
              role="alert"
              className="rounded-md border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              {contactCopy.failure}
            </div>
          )}

          {/* Submit button */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={status === "submitting"}
              withArrow={status !== "submitting"}
              className="font-semibold"
            >
              {status === "submitting" ? (
                <>
                  <Loader2
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span>{contactCopy.submitting}</span>
                </>
              ) : (
                <span>{contactCopy.submit}</span>
              )}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
