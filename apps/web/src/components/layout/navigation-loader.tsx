"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(true);
      setPrevPath(pathname);
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  if (!loading) return null;

   return (
     <div className="fixed top-0 left-0 right-0 z-[100]">
       <div className="h-0.5 bg-gradient-to-r from-metallic-gold via-metallic-silver to-metallic-gold animate-slide-progress" />
     </div>
   );
}
