export type LinkResolution =
  | { type: "external" }
  | { type: "hash" }
  | { type: "markdown"; hrefPath: string }
  | { type: "file"; rawUrl: string }
  | { type: "passthrough" };

function rawBasePath(group: string, fileId: string): string {
  return `/_/api/groups/${encodeURIComponent(group)}/files/${fileId}/raw`;
}

// rawFileUrl builds the raw-serving URL for a file's own bytes, using the file
// name as the trailing path segment. Pointing an <iframe> at this URL lets the
// browser resolve the document's relative assets (CSS/JS/images) against the
// same /raw/ base, which the server serves from the file's directory.
export function rawFileUrl(group: string, fileId: string, fileName: string): string {
  return `${rawBasePath(group, fileId)}/${encodeURIComponent(fileName)}`;
}

export function resolveLink(
  href: string | undefined,
  group: string,
  fileId: string,
): LinkResolution {
  if (!href || href.startsWith("http://") || href.startsWith("https://")) {
    return { type: "external" };
  }
  if (href.startsWith("#")) {
    return { type: "hash" };
  }
  const hrefPath = href.split("#")[0];
  if (hrefPath.endsWith(".md") || hrefPath.endsWith(".mdx")) {
    return { type: "markdown", hrefPath };
  }
  const basename = hrefPath.split("/").pop() || "";
  if (basename.includes(".")) {
    return { type: "file", rawUrl: `${rawBasePath(group, fileId)}/${href}` };
  }
  return { type: "passthrough" };
}

export function resolveImageSrc(
  src: string | undefined,
  group: string,
  fileId: string,
): string | undefined {
  if (src && !src.startsWith("http://") && !src.startsWith("https://")) {
    return `${rawBasePath(group, fileId)}/${src}`;
  }
  return src;
}

export function extractLanguage(className: string | undefined): string | null {
  const match = /language-(\w+)/.exec(className || "");
  return match ? match[1] : null;
}
