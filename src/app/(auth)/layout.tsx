import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height,100px)-var(--footer-height,100px))] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
         {/* You can add a logo or app name here if desired */}
        {children}
      </div>
    </div>
  );
}
