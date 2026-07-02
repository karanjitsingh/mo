interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

// Outward corner brackets (enter fullscreen)
const EXPAND_PATH =
  "M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4";
// Inward corner brackets (exit fullscreen)
const CONTRACT_PATH =
  "M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4";

export function FullscreenToggle({ isFullscreen, onToggle }: FullscreenToggleProps) {
  return (
    <button
      type="button"
      className="flex items-center justify-center bg-transparent border border-gh-border rounded-md p-1.5 text-gh-header-text cursor-pointer transition-colors duration-150 hover:bg-gh-bg-hover"
      onClick={onToggle}
      aria-label="Fullscreen"
      aria-pressed={isFullscreen}
      title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
    >
      <svg
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={isFullscreen ? CONTRACT_PATH : EXPAND_PATH}
        />
      </svg>
    </button>
  );
}
