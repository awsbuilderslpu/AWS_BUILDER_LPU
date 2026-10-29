export type UploadErrorCode =
  | "type"
  | "too_large"
  | "pixels"
  | "unreadable"
  | "compress"
  | "upload"
  | "signed_out";

export class UploadError extends Error {
  readonly code: UploadErrorCode;

  constructor(code: UploadErrorCode, message?: string) {
    super(message ?? code);
    this.name = "UploadError";
    this.code = code;
  }
}

