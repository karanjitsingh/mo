const MENU_ITEM_CLASS =
  "w-full px-3 py-1.5 text-left text-sm bg-transparent border-none cursor-pointer text-gh-text-secondary hover:bg-gh-bg-hover hover:text-gh-text transition-colors duration-150 flex items-center gap-2";

interface FolderContextMenuProps {
  menuId: string;
  dir: string;
  canUnwatch: boolean;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onCopyPath: (path: string) => void;
  onUnwatch: (dir: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export function FolderContextMenu({
  menuId,
  dir,
  canUnwatch,
  isOpen,
  onToggle,
  onCopyPath,
  onUnwatch,
  menuRef,
}: FolderContextMenuProps) {
  return (
    <>
      <button
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/file:opacity-100 flex items-center justify-center bg-transparent border-none cursor-pointer text-gh-text-secondary hover:text-gh-text rounded p-0.5 transition-opacity duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(menuId);
        }}
        title="More actions"
      >
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm13 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-10 bg-gh-bg border border-gh-border rounded-md shadow-lg py-1 min-w-[160px]"
        >
          <button className={MENU_ITEM_CLASS} onClick={() => onCopyPath(dir)}>
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
            </svg>
            Copy absolute path
          </button>
          {canUnwatch && (
            <>
              <div className="border-t border-gh-border my-1" />
              <button className={MENU_ITEM_CLASS} onClick={() => onUnwatch(dir)}>
                <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.143 2.31a.75.75 0 0 1 1.047-.167l14.5 10.5a.75.75 0 1 1-.88 1.214l-2.248-1.628C11.346 13.19 9.792 14 8 14c-2.1 0-3.8-1.12-5.04-2.45C1.72 10.22.93 8.8.55 8c.3-.64.86-1.64 1.7-2.64L.31 3.36A.75.75 0 0 1 .143 2.31Zm3.2 3.28c-.7.8-1.17 1.6-1.4 2.04.4.7 1 1.6 1.85 2.4C4.8 11.1 6.2 12.5 8 12.5c1.3 0 2.45-.6 3.38-1.4L9.64 9.85a2.5 2.5 0 0 1-3.5-2.54L3.34 5.59ZM8 2c2.1 0 3.8 1.12 5.04 2.45 1.24 1.33 2.03 2.75 2.41 3.55-.2.4-.56 1.04-1.1 1.76a.75.75 0 1 1-1.2-.9c.36-.48.62-.92.78-1.2-.4-.7-1-1.6-1.85-2.4C11.2 4.9 9.8 3.5 8 3.5c-.4 0-.78.07-1.14.18a.75.75 0 1 1-.43-1.44A5.6 5.6 0 0 1 8 2Z" />
                </svg>
                Unwatch folder
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
