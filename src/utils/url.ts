export function getAppUrl(): string {
  if (typeof window !== 'undefined') {
    const { origin, href } = window.location;
    if (origin && origin !== 'null' && (origin.startsWith('http://') || origin.startsWith('https://'))) {
      return origin;
    }
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      try {
        const parsed = new URL(href);
        return parsed.origin;
      } catch (e) {
        // ignore
      }
    }
  }

  return 'https://ais-dev-us3byv7llij3wlc7vegnvj-299903970613.us-east1.run.app';
}

export function getShareRoomUrl(roomCode: string): string {
  const baseUrl = getAppUrl();
  return `${baseUrl}?room=${encodeURIComponent(roomCode)}`;
}
