const LINKED_KEY = "clash-linked-member-v2";
const PHOTO_KEY = "clash-profile-photo-v2";
const ROLE_KEY = "clash-linked-role-v2";

const storage = (typeof window !== "undefined" ? localStorage : null) as Storage;

export function getCachedLinkedMemberId(): string | null {
  try {
    return storage?.getItem(LINKED_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setCachedLinkedMemberId(id: string | null) {
  try {
    if (id) storage?.setItem(LINKED_KEY, id);
    else {
      storage?.removeItem(LINKED_KEY);
      storage?.removeItem(ROLE_KEY);
    }
  } catch {}
}

export function getCachedProfilePhoto(): string {
  try {
    return storage?.getItem(PHOTO_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setCachedProfilePhoto(url: string) {
  try {
    if (url) storage?.setItem(PHOTO_KEY, url);
    else storage?.removeItem(PHOTO_KEY);
  } catch {}
}

export function getCachedRole(): string | null {
  try {
    return storage?.getItem(ROLE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setCachedRole(role: string | null) {
  try {
    if (role) storage?.setItem(ROLE_KEY, role);
    else storage?.removeItem(ROLE_KEY);
  } catch {}
}
