/** Normalize Israeli phone input to E.164 (+972...) */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("972") && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+972${digits.slice(1)}`;
  }

  if (digits.length === 9 && digits.startsWith("5")) {
    return `+972${digits}`;
  }

  return null;
}

export function isValidIsraeliPhone(phone: string): boolean {
  return toE164(phone) !== null;
}
