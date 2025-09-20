import { BookOpenCheck } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-foreground/80 hover:text-foreground transition-colors">
      <BookOpenCheck className="h-6 w-6 text-primary" />
      <span className="hidden sm:inline-block">School Companion</span>
    </Link>
  );
}
