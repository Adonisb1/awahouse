'use client';

import * as React from 'react';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { motion } from 'framer-motion';

interface PropertyCardProps {
  id: string;
  title: string;
  lga: string;
  priceYearlyKobo: number;
  imageUrl: string | null;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DOCS_SUBMITTED' | 'TITLE_CONFIRMED';
  rating: number | null;
  reviewCount: number;
  isSaved: boolean;
  onSave: (_id: string) => void;
  onClick: (_id: string) => void;
  variant?: 'card' | 'row';
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  lga,
  priceYearlyKobo,
  imageUrl,
  verificationStatus,
  rating,
  isSaved,
  onSave,
  onClick,
  variant = 'card',
}) => {
  const isCard = variant === 'card';

  return (
    <div
      onClick={() => onClick(id)}
      className={cn(
        'group relative bg-white overflow-hidden transition-all duration-300 cursor-pointer',
        isCard 
          ? 'w-[260px] flex-shrink-0 rounded-card shadow-card hover:scale-[1.02]' 
          : 'w-full flex flex-row items-center gap-4 p-4 border-b border-outline-variant hover:bg-sand-50'
      )}
    >
      {/* Image Section */}
      <div className={cn(
        'relative bg-sand-warm overflow-hidden',
        isCard ? 'h-[160px] w-full' : 'h-[100px] w-[100px] rounded-[12px]'
      )}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terra-light/30 to-terra/10 flex items-center justify-center">
            <span className="font-playfair italic text-terra-dark/20 text-4xl">Awahouse</span>
          </div>
        )}
        
        {/* Rating Badge (Card Variant Only) */}
        {isCard && rating && (
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-badge px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
            <Star className="text-amber-400 fill-amber-400" size={12} />
            <span className="text-[10px] font-bold text-charcoal">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={cn(
        'flex flex-col',
        isCard ? 'p-4' : 'flex-1'
      )}>
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className={cn(
              'font-playfair font-bold text-charcoal leading-tight line-clamp-1',
              isCard ? 'text-base' : 'text-lg'
            )}>
              {title}
            </h3>
            <p className="text-[11px] text-muted uppercase tracking-wider font-mono">
              {lga}, Lagos
            </p>
          </div>
          
          {!isCard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(id);
              }}
              className="p-2 rounded-full border border-outline-variant hover:border-terra hover:text-terra transition-colors"
            >
              <Heart 
                size={18} 
                className={cn(isSaved ? 'fill-terra text-terra' : 'text-muted')} 
              />
            </button>
          )}
        </div>

        <div className="mt-2 mb-3">
          <VerifiedBadge 
            type={verificationStatus === 'VERIFIED' ? 'fully_verified' : 'title_confirmed'} 
            size="sm" 
          />
        </div>

        <div className="flex justify-between items-end">
          <KoboDisplay kobo={priceYearlyKobo} period="yearly" size={isCard ? 'md' : 'lg'} />
          
          {isCard && (
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={(e) => {
                e.stopPropagation();
                onSave(id);
              }}
              className="p-1.5 rounded-full border border-outline-variant hover:border-terra hover:text-terra transition-colors"
            >
              <Heart 
                size={16} 
                className={cn(isSaved ? 'fill-terra text-terra' : 'text-muted')} 
              />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export { PropertyCard };
