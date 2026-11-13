// Small status toast (rendered once in BaseLayout as #toast, aria-live="polite").
let timer: ReturnType<typeof setTimeout> | undefined;

export function toast(message: string, ms = 2400): void {
  const el = document.getElementById('toast');
  if (!el) return;
  const text = el.querySelector('[data-toast-text]') ?? el;
  text.textContent = message;
  el.dataset.show = 'true';
  clearTimeout(timer);
  timer = setTimeout(() => {
    el.dataset.show = 'false';
  }, ms);
}
