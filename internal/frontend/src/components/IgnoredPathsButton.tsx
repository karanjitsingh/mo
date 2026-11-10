import { useEffect, useRef, useState } from "react";
import { excludeDir, includeDir } from "../hooks/useApi";

interface IgnoredPathsButtonProps {
  group: string;
  paths: string[];
}

export function IgnoredPathsButton({ group, paths }: IgnoredPathsButtonProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  };

  const handleAdd = async () => {
    const dir = value.trim();
    if (!dir) return;
    await run(async () => {
      await excludeDir(group, dir);
      setValue("");
    });
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className={`flex items-center justify-center bg-transparent border border-gh-border rounded-md p-1.5 cursor-pointer text-gh-header-text transition-colors duration-150 hover:bg-gh-bg-hover ${
          open ? "bg-gh-bg-hover" : ""
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Ignored paths"
        aria-expanded={open}
        title="Edit ignored paths"
      >
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <line x1="4" y1="20" x2="20" y2="4" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 z-40 w-96 max-w-[90vw] bg-gh-bg text-gh-text border border-gh-border rounded-md shadow-lg p-3 text-sm">
          <div className="font-semibold mb-1">Ignored paths</div>
          <p className="text-gh-text-secondary mb-2">
            Folders or globs skipped by watch patterns in this group, e.g. /abs/dir, **/node_modules
            or /abs/**/drafts. Files you open by hand still work.
          </p>
          {paths.length === 0 ? (
            <div className="text-gh-text-secondary mb-2">No ignored paths</div>
          ) : (
            <ul className="list-none m-0 mb-2 p-0 max-h-60 overflow-y-auto">
              {paths.map((p) => (
                <li key={p} className="flex items-center gap-2 py-1">
                  <code
                    className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                    title={p}
                  >
                    {p}
                  </code>
                  <button
                    type="button"
                    className="bg-transparent border-none cursor-pointer text-gh-text-secondary hover:text-gh-text"
                    onClick={() => run(() => includeDir(group, p))}
                    aria-label={`Stop ignoring ${p}`}
                    title="Stop ignoring"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="/abs/folder or **/node_modules"
              className="flex-1 min-w-0 px-2 py-1 bg-gh-bg-sidebar text-gh-text border border-gh-border rounded-md"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-transparent border border-gh-border rounded-md cursor-pointer text-gh-text hover:bg-gh-bg-hover"
            >
              Add
            </button>
          </form>
          {error && <div className="mt-2 text-red-500">{error}</div>}
        </div>
      )}
    </div>
  );
}
