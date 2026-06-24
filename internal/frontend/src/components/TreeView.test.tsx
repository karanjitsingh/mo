import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TreeView } from "./TreeView";
import type { FileEntry } from "../hooks/useApi";

const files: FileEntry[] = [
  { id: "f1", name: "top.md", path: "/proj/top.md" },
  { id: "f2", name: "guide.md", path: "/proj/docs/guide.md" },
  { id: "f3", name: "api.md", path: "/proj/docs/api.md" },
];

function renderTree() {
  return render(
    <TreeView
      files={files}
      activeGroup="default"
      activeFileId={null}
      showTitle={false}
      menuOpenId={null}
      otherGroups={[]}
      onFileSelect={() => {}}
      onMenuToggle={() => {}}
      onOpenInNewTab={() => {}}
      onCopyPath={() => {}}
      onCopyLink={() => {}}
      onMoveToGroup={() => {}}
      onRemove={() => {}}
      menuRef={createRef<HTMLDivElement>()}
    />,
  );
}

describe("TreeView default collapse", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("collapses all folders by default (nested files hidden, folder shown)", () => {
    renderTree();
    // The "docs" folder node is visible...
    expect(screen.getByText("docs")).toBeInTheDocument();
    // ...but its children are hidden until expanded.
    expect(screen.queryByText("guide.md")).toBeNull();
    expect(screen.queryByText("api.md")).toBeNull();
    // A top-level file is still visible.
    expect(screen.getByText("top.md")).toBeInTheDocument();
  });

  it("reveals folder contents when the folder is clicked", () => {
    renderTree();
    fireEvent.click(screen.getByText("docs"));
    expect(screen.getByText("guide.md")).toBeInTheDocument();
    expect(screen.getByText("api.md")).toBeInTheDocument();
  });

  it("honors a saved expanded state instead of forcing collapse", () => {
    // Saved empty array => user expanded everything; must be respected.
    localStorage.setItem("mo-sidebar-tree-collapsed", JSON.stringify({ default: [] }));
    renderTree();
    expect(screen.getByText("guide.md")).toBeInTheDocument();
  });
});
