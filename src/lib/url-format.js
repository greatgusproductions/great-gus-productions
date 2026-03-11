export function ensureTrailingSlashPath(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function stripTrailingSlash(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function toCanonicalUrl(pathOrUrl, base) {
  const url = new URL(String(pathOrUrl), base);
  url.pathname = ensureTrailingSlashPath(url.pathname);
  return url.toString();
}