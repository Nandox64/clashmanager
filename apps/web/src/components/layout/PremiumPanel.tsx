"use client";

import React, { HTMLAttributes } from "react";
import clsx from "clsx";

export const PremiumPanel = ({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <aside className={clsx("premium-sidebar", className)} {...rest}>
      {children}
    </aside>
  );
};
