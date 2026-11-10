// patternBaseDir returns the literal directory prefix of a glob pattern
// (everything before the first segment containing glob characters).
function patternBaseDir(pattern: string): string {
  const segments = pattern.split("/");
  const idx = segments.findIndex((s) => /[*?[\]{}]/.test(s));
  return (idx === -1 ? segments.slice(0, -1) : segments.slice(0, idx)).join("/");
}

// patternsUnderDir returns the watch patterns rooted at dir or any subdirectory.
export function patternsUnderDir(patterns: string[], dir: string): string[] {
  return patterns.filter((p) => {
    const base = patternBaseDir(p);
    return base === dir || base.startsWith(`${dir}/`);
  });
}

// patternsCoveringDir returns recursive patterns rooted strictly above dir,
// i.e. ones that match files in dir without a pattern of its own.
export function patternsCoveringDir(patterns: string[], dir: string): string[] {
  return patterns.filter((p) => p.includes("**") && dir.startsWith(`${patternBaseDir(p)}/`));
}
