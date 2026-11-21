import { useRef, useState, type FormEvent } from "react";
import { Settings, X } from "lucide-react";
import {
  defaultPrayerSettings,
  maxPrayerOffset,
  normalizePrayerSettings,
  prayerMethods,
  prayerNames,
  type PrayerName,
  type PrayerSettings,
} from "@/lib/prayerSchedule";

const fieldClass =
  "min-h-11 w-full rounded-lg border bg-background px-3 text-sm";
const secondaryButton =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold text-primary hover:bg-secondary";

function offsetFields(settings: PrayerSettings) {
  return Object.fromEntries(
    prayerNames.map((name) => [name, String(settings.offsets[name])]),
  ) as Record<PrayerName, string>;
}

export function PrayerSettingsDialog({
  settings,
  onSave,
}: {
  settings: PrayerSettings;
  onSave: (settings: PrayerSettings) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const methodInput = useRef<HTMLSelectElement>(null);
  const [method, setMethod] = useState(settings.method);
  const [offsets, setOffsets] = useState(() => offsetFields(settings));

  function loadDraft(value: PrayerSettings) {
    setMethod(value.method);
    setOffsets(offsetFields(value));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextOffsets = Object.fromEntries(
      prayerNames.map((name) => [name, Number(offsets[name])]),
    ) as PrayerSettings["offsets"];
    onSave(normalizePrayerSettings({ method, offsets: nextOffsets }));
    dialog.current?.close();
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label="Prayer settings"
        onClick={() => {
          loadDraft(settings);
          dialog.current?.showModal();
          methodInput.current?.focus();
        }}
        className={secondaryButton}
      >
        <Settings aria-hidden="true" className="size-4" />
        Settings
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="prayer-settings-heading"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/50 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="prayer-settings-heading" className="font-display text-2xl">
              Prayer settings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Match the method and times used by your local mosque.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close prayer settings"
            onClick={() => dialog.current?.close()}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-secondary"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <label className="block space-y-1.5 text-sm font-semibold">
            Calculation method
            <select
              ref={methodInput}
              value={method}
              onChange={(event) => setMethod(Number(event.target.value))}
              className={fieldClass}
            >
              {prayerMethods.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">
              Adjustments in minutes
            </legend>
            <p
              id="prayer-offset-help"
              className="text-xs leading-relaxed text-muted-foreground"
            >
              Use a negative number for earlier or positive for later (−
              {maxPrayerOffset} to +{maxPrayerOffset}).
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
              {prayerNames.map((name) => (
                <label
                  key={name}
                  className="block space-y-1 text-xs font-semibold"
                >
                  {name}
                  <input
                    type="number"
                    min={-maxPrayerOffset}
                    max={maxPrayerOffset}
                    step={1}
                    aria-describedby="prayer-offset-help"
                    value={offsets[name]}
                    onChange={(event) =>
                      setOffsets({
                        ...offsets,
                        [name]: event.target.value,
                      })
                    }
                    className={fieldClass}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <button
              type="button"
              className={secondaryButton}
              onClick={() => loadDraft(defaultPrayerSettings)}
            >
              Reset defaults
            </button>
            <button
              type="submit"
              className="min-h-10 cursor-pointer rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Save settings
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
