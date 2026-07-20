export async function shareContent(data: ShareData) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return "shared" as const;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled" as const;
    }
  }

  if (!data.url) return "unavailable" as const;
  try {
    await navigator.clipboard.writeText(data.url);
    return "copied" as const;
  } catch {
    return "unavailable" as const;
  }
}
