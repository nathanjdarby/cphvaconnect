
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted/50 text-muted-foreground py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} CPHVA Connect. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Experience the future at the CPHVA Conference.
        </p>
        <div className="mt-2">
          <Link href="/privacy-policy" className="text-xs hover:text-primary underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
