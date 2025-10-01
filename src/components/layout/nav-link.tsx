
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  mobile?: boolean;
  mobileFullWidth?: boolean; // New prop for full-width mobile items in dropdown
}

export default function NavLink({ href, children, icon, mobile = false, mobileFullWidth = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  if (mobileFullWidth) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center w-full px-2 py-1.5 rounded-sm text-sm transition-colors",
          "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", // Mimic DropdownMenuItem focus
          isActive ? "bg-accent/50 text-primary font-semibold" : "text-foreground hover:bg-accent/80"
        )}
      >
        {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-4 w-4" })}
        {children}
      </Link>
    );
  }

  if (mobile) {
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center text-xs p-1 rounded-md transition-colors",
          isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {icon && React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 mb-0.5" })}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-foreground/70 hover:text-foreground"
      )}
    >
      {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })}
      {children}
    </Link>
  );
}
