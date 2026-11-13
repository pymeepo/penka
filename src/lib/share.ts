// Web Share API with a copy-link fallback. Client-only.
import { toast } from './toast';

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Old WebViews / insecure context: fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export async function share(data: ShareData): Promise<void> {
  if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
      return;
    } catch (err) {
      // The user closed the share sheet — nothing to do.
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }
  toast((await copy(data.url)) ? 'Ссылка скопирована' : `Скопируйте ссылку: ${data.url}`);
}

/** Wires every [data-share] button: data-share-title, data-share-text, data-share-url. */
export function bindShareButtons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-share]').forEach((btn) => {
    btn.addEventListener('click', () => {
      void share({
        title: btn.dataset.shareTitle ?? document.title,
        text: btn.dataset.shareText,
        url: btn.dataset.shareUrl ?? location.href,
      });
    });
  });
}
