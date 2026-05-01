export const CONTENT_TYPE_ARTICLE = 10;
export const CONTENT_TYPE_VIDEO = 20;
export const VISIBILITY_PUBLIC = 10;

export type ContentInteractionScene = "ARTICLE" | "VIDEO";

export function getInteractionSceneFromContentType(
  contentType?: number,
): ContentInteractionScene {
  return contentType === CONTENT_TYPE_VIDEO ? "VIDEO" : "ARTICLE";
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
