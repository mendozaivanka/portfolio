const EVENT = "app:toast";

/** Show a toast from anywhere (any island); the <Toaster /> in the layout displays it. */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

export function onToast(cb: (message: string) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export async function copyText(text: string, successMessage = `Copied ${text}`) {
  try {
    await navigator.clipboard.writeText(text);
    toast(successMessage);
  } catch {
    // Clipboard blocked (e.g. insecure context): at least show the text
    toast(text);
  }
}
