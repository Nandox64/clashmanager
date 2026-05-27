const LINKED_KEY = "clash-linked-member";
const PHOTO_KEY = "clash-profile-photo";
const ROLE_KEY = "clash-linked-role";

export function getCachedLinkedMemberId(): string | null {
  try {
    return sessionStorage.getItem(LINKED_KEY);
  } catch {
    return null;
  }
}

export function setCachedLinkedMemberId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(LINKED_KEY, id);
    else {
      sessionStorage.removeItem(LINKED_KEY);
      sessionStorage.removeItem(ROLE_KEY);
    }
  } catch {}
}

export function getCachedProfilePhoto(): string {
  try {
    return sessionStorage.getItem(PHOTO_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setCachedProfilePhoto(url: string) {
  try {
    if (url) sessionStorage.setItem(PHOTO_KEY, url);
    else sessionStorage.removeItem(PHOTO_KEY);
  } catch {}
}

export function getCachedRole(): string | null {
  try {
    return sessionStorage.getItem(ROLE_KEY);
  } catch {
    return null;
  }
}

export function setCachedRole(role: string | null) {
  try {
    if (role) sessionStorage.setItem(ROLE_KEY, role);
    else sessionStorage.removeItem(ROLE_KEY);
  } catch {}
}
