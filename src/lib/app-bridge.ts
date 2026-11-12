// Bridge to the native shell (React Native WebView). On the regular site every call is a no-op.

interface ReactNativeWebView {
  postMessage(message: string): void;
}

declare global {
  interface Window {
    ReactNativeWebView?: ReactNativeWebView;
  }
}

export type AppMessage = { type: 'cart'; count: number };

export function isInApp(): boolean {
  return document.documentElement.classList.contains('in-app');
}

export function postToApp(message: AppMessage): void {
  try {
    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  } catch {
    // The shell may not be ready yet; the next cart change will resend the count.
  }
}
