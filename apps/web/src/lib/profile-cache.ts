const LINKED_KEY = "clash-linked-member-v2";
const PHOTO_KEY = "clash-profile-photo-v2";
const ROLE_KEY = "clash-linked-role-v2";

const storage = (typeof window !== "undefined" ? localStorage : null) as Storage;

let currentUid: string | null = null;

export function setCurrentProfileUid(uid: string | null) {
  currentUid = uid;
}

function prefixedKey(base: string): string {
  return currentUid ? `${base}_${currentUid}` : base;
}

export function getCachedLinkedMemberId(): string | null {
  try {
    return storage?.getItem(prefixedKey(LINKED_KEY)) ?? null;
  } catch {
    return null;
  }
}

export function setCachedLinkedMemberId(id: string | null) {
  try {
    const key = prefixedKey(LINKED_KEY);
    if (id) storage?.setItem(key, id);
    else {
      storage?.removeItem(key);
      storage?.removeItem(prefixedKey(ROLE_KEY));
    }
  } catch {}
}

export function getCachedProfilePhoto(): string {
  try {
    return storage?.getItem(prefixedKey(PHOTO_KEY)) ?? "";
  } catch {
    return "";
  }
}

export function setCachedProfilePhoto(url: string) {
  try {
    const key = prefixedKey(PHOTO_KEY);
    if (url) storage?.setItem(key, url);
    else storage?.removeItem(key);
  } catch {}
}

export function getCachedRole(): string | null {
  try {
    return storage?.getItem(prefixedKey(ROLE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export function setCachedRole(role: string | null) {
  try {
    const key = prefixedKey(ROLE_KEY);
    if (role) storage?.setItem(key, role);
    else storage?.removeItem(key);
  } catch {}
}

export function clearProfileCacheForUser(uid: string) {
  try {
    storage?.removeItem(`${LINKED_KEY}_${uid}`);
    storage?.removeItem(`${PHOTO_KEY}_${uid}`);
    storage?.removeItem(`${ROLE_KEY}_${uid}`);
  } catch {}
}
