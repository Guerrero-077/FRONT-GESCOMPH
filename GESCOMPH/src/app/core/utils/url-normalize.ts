export interface NormalizeUrlOptions {
  stripAdminPrefix?: boolean;
}

export function normalizeUrl(url: unknown, options: NormalizeUrlOptions = {}): string {
  if (typeof url !== 'string') return '';

  const { stripAdminPrefix = true } = options;

  let end = url.length;
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    end = hashIndex;
  }

  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1 && queryIndex < end) {
    end = queryIndex;
  }

  let normalized = url.slice(0, end).trim();
  if (!normalized) return '';

  while (normalized.startsWith('/')) {
    normalized = normalized.slice(1);
  }

  if (!normalized) return '';

  const adminPrefix = 'admin/';
  if (
    stripAdminPrefix &&
    normalized.length >= adminPrefix.length &&
    normalized.slice(0, adminPrefix.length).toLowerCase() === adminPrefix
  ) {
    normalized = normalized.slice(adminPrefix.length);
  }

  return normalized.trim();
}
