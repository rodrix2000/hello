'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { SignOutButton } from '@/components/dashboard/SignOutButton';

const navItems = [
  ['01', 'Dashboard', '/dashboard'],
  ['02', 'Profile', '/dashboard/profile'],
  ['03', 'QR', '/dashboard/qr'],
  ['04', 'Contacts', '/dashboard/contacts'],
  ['05', 'Settings', '/dashboard/settings']
];

function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);

  return (
    <nav className="dashboardNav">
      {navItems.map(([glyph, label, href]) => {
        const active = isActivePath(pathname, href);

        return (
          <Link key={href} ref={active ? activeRef : undefined} href={href} className={active ? 'isActive' : undefined}>
            <span className="navGlyph">{glyph}</span>
            <span>{label}</span>
          </Link>
        );
      })}
      <SignOutButton />
    </nav>
  );
}
