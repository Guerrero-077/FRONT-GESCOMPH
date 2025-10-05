export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export function isApiRequest(url: string, apiBase: string): boolean {
  return url.startsWith(apiBase);
}
