'use client';

import * as React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopNavProps {
  variant: 'brand' | 'back' | 'modal';
  title?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const TopNav: React.FC<TopNavProps> = ({ variant, title, onBack, actions }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <nav className="h-[60px] bg-sand border-b border-outline-variant sticky top-0 z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {variant === 'back' && (
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-outline-variant text-charcoal active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        
        {variant === 'modal' && (
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-outline-variant text-charcoal active:scale-95 transition-transform"
          >
            <X size={20} />
          </button>
        )}

        {variant === 'brand' ? (
          <h1 className="font-playfair italic font-black text-2xl text-terra">
            Awa<span className="text-charcoal not-italic">house</span>
          </h1>
        ) : (
          <h2 className="font-playfair font-bold text-lg text-charcoal truncate max-w-[200px]">
            {title}
          </h2>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </nav>
  );
};

export { TopNav };
