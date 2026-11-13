// Russian phone mask: +7 (XXX) XXX-XX-XX. Client-side helpers.

/** Up to 10 national digits from any input («8 900…», «+7 900…», «900…»). */
export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 10 && (digits.startsWith('7') || digits.startsWith('8'))) digits = digits.slice(1);
  else if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function formatPhone(national: string): string {
  const d = national.slice(0, 10);
  if (!d) return '';
  // Separators appear only before the next digit, so Backspace never gets stuck on them.
  let out = '+7 (' + d.slice(0, 3);
  if (d.length > 3) out += ') ' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
}

/** National digits from a masked value («+7 (900) 12…» → «90012»). The +7 prefix is never a digit of the number. */
export function maskedDigits(value: string): string {
  const v = value.trim();
  return v.startsWith('+7') ? v.slice(2).replace(/\D/g, '').slice(0, 10) : phoneDigits(v);
}

export function isCompletePhone(value: string): boolean {
  return maskedDigits(value).length === 10;
}

/** Keeps an <input type="tel"> formatted while typing and pasting. */
export function attachPhoneMask(input: HTMLInputElement): void {
  const apply = (): void => {
    const raw = input.value;
    // Typing «8» or «7» into an empty field means the country code, not the first digit.
    const digits = /^\s*[78]$/.test(raw) ? '' : phoneDigits(raw.startsWith('+7') ? raw.slice(2) : raw);
    input.value = digits ? formatPhone(digits) : raw.startsWith('+') ? '+7 (' : '';
  };
  input.addEventListener('input', apply);
  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7 (';
  });
  input.addEventListener('blur', () => {
    if (maskedDigits(input.value).length === 0) input.value = '';
  });
  if (input.value) apply();
}
