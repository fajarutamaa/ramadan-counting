import { useEffect, useRef, useState } from "react";
import { Smartphone, X } from "lucide-react";

interface InstallPrompt extends Event {
  prompt(): Promise<unknown>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [pending, setPending] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    const mode = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(isStandalone());
    function savePrompt(event: Event) {
      event.preventDefault();
      setPending(event as InstallPrompt);
    }
    function finishInstall() {
      setPending(null);
      setInstalled(true);
    }
    window.addEventListener("beforeinstallprompt", savePrompt);
    window.addEventListener("appinstalled", finishInstall);
    mode.addEventListener("change", update);
    return () => {
      window.removeEventListener("beforeinstallprompt", savePrompt);
      window.removeEventListener("appinstalled", finishInstall);
      mode.removeEventListener("change", update);
    };
  }, []);

  async function install() {
    if (!pending) {
      dialog.current?.showModal();
      return;
    }
    setPending(null);
    try {
      await pending.prompt();
      if ((await pending.userChoice).outcome === "accepted") setInstalled(true);
    } catch {
      dialog.current?.showModal();
    }
  }

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={install}
        aria-label="Install Nur"
        title="Install Nur"
        className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
      >
        <Smartphone aria-hidden="true" className="size-4" />
        <span className="hidden lg:inline">Install</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="install-nur-heading"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/50 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="install-nur-heading" className="font-display text-2xl">
              Install Nur
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open Nur from an icon on your home screen or desktop.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close install guide"
            onClick={() => dialog.current?.close()}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-secondary"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-semibold">iPhone or iPad</dt>
            <dd className="mt-0.5 text-muted-foreground">
              Open Nur in Safari, tap Share, then choose Add to Home Screen. If
              shown, turn on Open as Web App.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Android or desktop</dt>
            <dd className="mt-0.5 text-muted-foreground">
              Open the browser menu and look for Install, Add to Home screen, or
              Add to Dock. The name varies by browser.
            </dd>
          </div>
        </dl>
        <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
          Open Nur online at least once to save prayer times for offline use. If
          your browser doesn’t offer installation, you can still bookmark this
          page.
        </p>
      </dialog>
    </>
  );
}
