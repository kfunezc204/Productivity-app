export function extractUrls(text: string): string[] {
  const regex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  return [...new Set(text.match(regex) ?? [])];
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
