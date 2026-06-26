import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MarkdownViewer } from "./MarkdownViewer";
import { fetchFileContent, openRelativeFile } from "../hooks/useApi";

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(),
  },
}));

vi.mock("../hooks/useApi", () => ({
  fetchFileContent: vi.fn().mockResolvedValue({ content: "# Hello", baseDir: "/repo" }),
  openRelativeFile: vi.fn(),
}));

// jsdom has no layout, so stub getBoundingClientRect: the scroll container and
// the sticky bar sit at the top, and the heading goes wherever a test wants it.
let scrollContainer: HTMLElement;
let headingRect: { top: number; bottom: number };
const barRect = { top: 0, bottom: 37 };
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    left: 0,
    right: 0,
    width: 0,
    height: bottom - top,
    x: 0,
    y: top,
  } as DOMRect;
}

function renderViewer(props: Partial<Parameters<typeof MarkdownViewer>[0]> = {}) {
  return render(
    <MarkdownViewer
      fileId="aaa11111"
      fileName="README.md"
      activeGroup="default"
      revision={0}
      scrollContainer={scrollContainer}
      onFileOpened={() => {}}
      onHeadingsChange={() => {}}
      isTocOpen={false}
      onTocToggle={() => {}}
      onRemoveFile={() => {}}
      isWide={false}
      fontSize="medium"
      {...props}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  scrollContainer = document.createElement("div");
  headingRect = { top: 100, bottom: 150 }; // on screen by default
  Element.prototype.getBoundingClientRect = function () {
    if (this === scrollContainer) return rect(0, 800);
    // The sticky bar is the only div carrying a title attribute.
    if (this.tagName === "DIV" && this.hasAttribute("title"))
      return rect(barRect.top, barRect.bottom);
    if (/^H[1-6]$/.test(this.tagName)) return rect(headingRect.top, headingRect.bottom);
    return rect(0, 0);
  };
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
});

describe("MarkdownViewer file label", () => {
  it("shows the file name alone while the title is on screen", async () => {
    headingRect = { top: 100, bottom: 150 };
    renderViewer({ title: "Project Readme", filePath: "/home/me/code/mo/docs/README.md" });

    const label = await screen.findByTitle("/home/me/code/mo/docs/README.md");
    expect(label.textContent).toBe("README.md");
    // The label must not be part of the rendered markdown content.
    expect(label.closest(".markdown-body")).toBeNull();
  });

  it("folds the title in once the heading scrolls behind the bar", async () => {
    headingRect = { top: -50, bottom: -10 };
    renderViewer({ title: "Project Readme", filePath: "/home/me/code/mo/docs/README.md" });

    const label = await screen.findByTitle("/home/me/code/mo/docs/README.md");
    // The folded text is applied by the post-render geometry effect.
    await waitFor(() => expect(label.textContent).toBe("Project Readme - README.md"));
  });

  it("keeps just the file name when the file has no title", async () => {
    headingRect = { top: -50, bottom: -10 };
    renderViewer({ filePath: "/home/me/code/mo/docs/README.md" });

    const label = await screen.findByTitle("/home/me/code/mo/docs/README.md");
    expect(label.textContent).toBe("README.md");
  });

  it("uses the file name as the tooltip for uploaded files", async () => {
    headingRect = { top: -50, bottom: -10 };
    renderViewer({ title: "Pasted", uploaded: true });

    const label = await screen.findByTitle("README.md");
    await waitFor(() => expect(label.textContent).toBe("Pasted - README.md"));
  });

  it("right-aligns the label text", async () => {
    renderViewer({ title: "Project Readme", filePath: "/home/me/code/mo/docs/README.md" });

    await screen.findByTitle("/home/me/code/mo/docs/README.md");
    expect(screen.getByTestId("file-label")).toHaveClass("text-right");
  });
});

describe("MarkdownViewer modified timestamp", () => {
  it("shows the file's last-modified timestamp on the left", async () => {
    vi.mocked(fetchFileContent).mockResolvedValue({
      content: "# Hello",
      baseDir: "/repo",
      modTime: "2026-06-26T07:43:00Z",
    });
    renderViewer({ filePath: "/home/me/docs/README.md" });

    const ts = await screen.findByTestId("file-modified");
    expect(ts.textContent).toMatch(/2026/);
    // The filename/title still renders on the right.
    expect(screen.getByTestId("file-label").textContent).toBe("README.md");
  });

  it("leaves the timestamp empty when the server provides none", async () => {
    vi.mocked(fetchFileContent).mockResolvedValue({ content: "# Hello", baseDir: "/repo" });
    renderViewer({ filePath: "/home/me/docs/README.md" });

    await screen.findByTestId("file-label");
    expect(screen.getByTestId("file-modified").textContent).toBe("");
  });
});

describe("MarkdownViewer HTML files", () => {
  it("renders an iframe pointing at the raw endpoint instead of source", async () => {
    vi.mocked(fetchFileContent).mockResolvedValue({
      content: "<!DOCTYPE html><html><body><h1>Hi</h1></body></html>",
      baseDir: "/repo",
    });
    const { container } = renderViewer({ fileId: "ccc33333", fileName: "page.html" });

    const iframe = await waitFor(() => {
      const el = container.querySelector("iframe");
      if (!el) throw new Error("iframe not yet rendered");
      return el;
    });
    const src = iframe.getAttribute("src") ?? "";
    expect(src).toMatch(
      /^\/_\/api\/groups\/default\/files\/ccc33333\/raw\/page\.html\?_=/,
    );
    // It must NOT fall through to the syntax-highlighted source view.
    expect(container.querySelector("pre")).toBeNull();
  });

  it("hides the TOC and Raw toggles for HTML files", async () => {
    vi.mocked(fetchFileContent).mockResolvedValue({
      content: "<html></html>",
      baseDir: "/repo",
    });
    const { container } = renderViewer({ fileId: "ccc33333", fileName: "page.html" });
    await waitFor(() => {
      if (!container.querySelector("iframe")) throw new Error("iframe not yet rendered");
    });
    expect(screen.queryByRole("button", { name: /raw/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /table of contents|toc/i })).toBeNull();
  });
});

describe("MarkdownViewer relative links", () => {
  beforeEach(() => {
    vi.mocked(fetchFileContent).mockResolvedValue({
      content: "[Next page](next.md)",
      baseDir: "/repo",
    });
    vi.mocked(openRelativeFile).mockResolvedValue({
      id: "bbb22222",
      name: "next.md",
      path: "/repo/next.md",
    });
  });

  it("points the href at a self-resolving relative-open URL", async () => {
    renderViewer();
    const link = await screen.findByRole("link", { name: "Next page" });
    expect(link).toHaveAttribute("href", "/?from=aaa11111&open=next.md");
  });

  it("opens in place on a plain click", async () => {
    const onFileOpened = vi.fn();
    renderViewer({ onFileOpened });
    const link = await screen.findByRole("link", { name: "Next page" });

    const notPrevented = fireEvent.click(link);

    expect(notPrevented).toBe(false); // preventDefault was called
    await waitFor(() => expect(onFileOpened).toHaveBeenCalledWith("bbb22222"));
    expect(openRelativeFile).toHaveBeenCalledWith("default", "aaa11111", "next.md");
  });

  it("lets the browser handle a Cmd/Ctrl click natively", async () => {
    const onFileOpened = vi.fn();
    renderViewer({ onFileOpened });
    const link = await screen.findByRole("link", { name: "Next page" });

    const notPrevented = fireEvent.click(link, { metaKey: true });

    expect(notPrevented).toBe(true); // default preserved → new browser tab
    expect(openRelativeFile).not.toHaveBeenCalled();
    expect(onFileOpened).not.toHaveBeenCalled();
  });
});
