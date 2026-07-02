import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FullscreenToggle } from "./FullscreenToggle";

describe("FullscreenToggle", () => {
  it("shows 'Fullscreen' title when not fullscreen", () => {
    render(<FullscreenToggle isFullscreen={false} onToggle={() => {}} />);
    expect(screen.getByTitle("Fullscreen")).toBeInTheDocument();
  });

  it("shows 'Exit fullscreen' title when fullscreen", () => {
    render(<FullscreenToggle isFullscreen={true} onToggle={() => {}} />);
    expect(screen.getByTitle("Exit fullscreen (Esc)")).toBeInTheDocument();
  });

  it("has aria-pressed false when not fullscreen", () => {
    render(<FullscreenToggle isFullscreen={false} onToggle={() => {}} />);
    const button = screen.getByRole("button", { name: "Fullscreen" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("has aria-pressed true when fullscreen", () => {
    render(<FullscreenToggle isFullscreen={true} onToggle={() => {}} />);
    const button = screen.getByRole("button", { name: "Fullscreen" });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FullscreenToggle isFullscreen={false} onToggle={onToggle} />);
    await user.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
