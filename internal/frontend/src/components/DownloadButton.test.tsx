import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DownloadButton } from "./DownloadButton";

describe("DownloadButton", () => {
  let clickSpy: ReturnType<typeof vi.spyOn>;
  let lastAnchor: HTMLAnchorElement | null;

  beforeEach(() => {
    lastAnchor = null;
    // jsdom doesn't implement createObjectURL/revokeObjectURL.
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:mock"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    // Capture the anchor and prevent a real navigation on click.
    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        lastAnchor = this;
      });
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it("renders a download control", () => {
    render(<DownloadButton content="# hi" fileName="notes.md" />);
    expect(screen.getByRole("button", { name: /download file/i })).toBeInTheDocument();
  });

  it("triggers a download named after the file", () => {
    render(<DownloadButton content="# hi" fileName="notes.md" />);
    fireEvent.click(screen.getByRole("button", { name: /download file/i }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(lastAnchor?.getAttribute("download")).toBe("notes.md");
    expect(lastAnchor?.getAttribute("href")).toBe("blob:mock");
    // Anchor is cleaned up and object URL revoked.
    expect(document.querySelector("a[download]")).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });

  it("falls back to a default name when fileName is empty", () => {
    render(<DownloadButton content="x" fileName="" />);
    fireEvent.click(screen.getByRole("button", { name: /download file/i }));
    expect(lastAnchor?.getAttribute("download")).toBe("download");
  });
});
