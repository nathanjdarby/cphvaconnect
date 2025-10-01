
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';

const LOCAL_STORAGE_BANNER_DISMISSED_KEY = 'cphva-dataUsageBannerDismissed';

export default function DataUsageBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(LOCAL_STORAGE_BANNER_DISMISSED_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(LOCAL_STORAGE_BANNER_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground p-4 shadow-lg z-[100] print:hidden">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center">
          <Info className="h-6 w-6 mr-3 mt-1 sm:mt-0 flex-shrink-0" />
          <p className="text-sm">
            This application uses your browser&apos;s local storage to remember your preferences, login status, and ticket information to enhance your experience. 
            Please see our <Link href="/privacy-policy" className="font-semibold underline hover:text-accent transition-colors">Privacy Policy</Link> for more details.
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleDismiss}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 flex-shrink-0"
        >
          <X className="h-4 w-4 mr-1 sm:mr-2" /> Got it
        </Button>
      </div>
    </div>
  );
}
