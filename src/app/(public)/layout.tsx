import React from 'react';
import { AuthSideBanner } from '@/components/auth/AuthSideBanner';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white transition-colors duration-300">
      {/* Left side: Dynamic Content (Forms, Welcome screen, etc.) */}
      <main className="flex min-h-screen w-full lg:w-1/2 flex-col justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 bg-white transition-all duration-300 ease-in-out">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </main>

      {/* Right side: Interactive TaskFlow Hero Banner with authbackground.jpg */}
      <AuthSideBanner />
    </div>
  );
}
