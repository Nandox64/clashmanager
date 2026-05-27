"use client";

import { useEffect } from "react";

const SW_URL = "/sw.js";
const SW_SCOPE = "/";

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // Force a clean SW install by unregistering any stale registration first.
    // The old SW might cache its own file via Cache API, preventing updates.
    // Unregistering removes the old controller so the new one can activate.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      const unreg = regs.map((r) => r.unregister());
      Promise.all(unreg).then(() => {
        navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).catch(() => {});
      });
    });
  }, []);

  return null;
}
