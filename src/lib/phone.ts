// Russian phone mask: +7 (XXX) XXX-XX-XX. Client-side helpers.

const PREFIX = '+7 (';

/** Up to 10 national digits from any input («8 900…», «+7 900…», «900…»). */
export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 10 && (digits.startsWith('7') || digits.startsWith('8'))) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function formatPhone(national: string): string {
  const d = national.slice(0, 10);
  if (!d) return '';
  // Separators appear only before the next digit, so Backspace never gets stuck on them.
  let out = PREFIX + d.slice(0, 3);
  if (d.length > 3) out += ') ' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
}

/**
 * National digits from a masked value: «+7 (900) 12…» → «90012».
 * The country-code 7 is the first 7 before «(», even if the caret put a digit in front of it
 * («+97 (» → «9»), so a 7 typed inside the prefix area never shifts the number.
 */
export function maskedDigits(value: string): string {
  const v = value.trim();
  const plus = v.indexOf('+');
  if (plus === -1) return phoneDigits(v);
  // Digits may land anywhere around «+7 (» when the caret was inside the prefix: «9+7 (», «+97 (».
  const paren = v.indexOf('(', plus);
  const cut = paren >= 0 ? paren : Math.min(v.length, plus + 3);
  const head = v.slice(0, cut);
  const seven = head.indexOf('7', plus);
  const headDigits = (seven >= 0 ? head.slice(0, seven) + head.slice(seven + 1) : head).replace(/\D/g, '');
  return (headDigits + v.slice(cut).replace(/\D/g, '')).slice(0, 10);
}

export function isCompletePhone(value: string): boolean {
  return maskedDigits(value).length === 10;
}

/** Keeps an <input type="tel"> formatted while typing and pasting. */
export function attachPhoneMask(input: HTMLInputElement): void {
  const apply = (): void => {
    const raw = input.value;
    // Typing «8» or «7» into an empty field means the country code, not the first digit.
    const digits = /^\s*[78]$/.test(raw) ? '' : maskedDigits(raw);
    input.value = digits ? formatPhone(digits) : raw.trim().startsWith('+') ? PREFIX : '';
  };

  // Never let the caret sit inside «+7 (».
  const moveCaret = (): void => {
    const start = input.selectionStart ?? 0;
    if (input.value.startsWith(PREFIX) && start < PREFIX.length && input.selectionEnd === start) {
      input.setSelectionRange(input.value.length, input.value.length);
    }
  };
  // Run now and after the click has placed the caret.
  const guardCaret = (): void => {
    moveCaret();
    requestAnimationFrame(moveCaret);
  };

  input.addEventListener('input', apply);
  input.addEventListener('focus', () => {
    if (!input.value) {
      input.value = PREFIX;
      input.setSelectionRange(PREFIX.length, PREFIX.length);
    }
    guardCaret();
  });
  input.addEventListener('click', guardCaret);
  input.addEventListener('keyup', (e) => {
    if (e.key === 'Home' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') guardCaret();
  });
  input.addEventListener('blur', () => {
    if (maskedDigits(input.value).length === 0) input.value = '';
  });
  if (input.value) apply();
}
