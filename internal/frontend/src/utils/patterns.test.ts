import { describe, expect, it } from "vitest";
import { patternsCoveringDir, patternsUnderDir } from "./patterns";

describe("patternsUnderDir", () => {
  const patterns = ["/p/docs/*.md", "/p/docs/sub/**/*.md", "/p/other/*.md", "/p/docs2/*.md"];

  it("matches patterns at or below the directory", () => {
    expect(patternsUnderDir(patterns, "/p/docs")).toEqual(["/p/docs/*.md", "/p/docs/sub/**/*.md"]);
  });

  it("does not match sibling directories sharing a prefix", () => {
    expect(patternsUnderDir(patterns, "/p/other")).toEqual(["/p/other/*.md"]);
  });
});

describe("patternsCoveringDir", () => {
  it("returns recursive patterns rooted above the directory", () => {
    const patterns = ["/p/**/*.md", "/p/docs/*.md", "/q/**/*.md"];
    expect(patternsCoveringDir(patterns, "/p/docs/sub")).toEqual(["/p/**/*.md"]);
    expect(patternsCoveringDir(patterns, "/p")).toEqual([]);
  });
});
