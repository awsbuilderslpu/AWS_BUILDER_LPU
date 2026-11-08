import QRCode from "qrcode";

export async function generateQrSvg(
  text: string,
  options?: { margin?: number; color?: { dark?: string; light?: string } }
): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: "svg",
      margin: options?.margin ?? 2,
      color: {
        dark: options?.color?.dark ?? "#000000",
        light: options?.color?.light ?? "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code SVG", err);
    return "";
  }
}

export async function generateQrDataUrl(
  text: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width ?? 256,
      margin: options?.margin ?? 2,
    });
  } catch (err) {
    console.error("Failed to generate QR code data URL", err);
    return "";
  }
}

