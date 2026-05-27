"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

   return (
     <div className="fixed top-0 left-0 right-0 z-[100]">
       <div className="h-0.5 animate-slide-progress"
         style={{
           background: 'linear-gradient(90deg, #b8860b, #ffd700, #c8cfd8, #ffd700, #b8860b)',
           backgroundSize: '200% 100%',
         }}
       />
     </div>
   );
}
