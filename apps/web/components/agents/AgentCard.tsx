'use client';

import * as React from 'react';
import Image from 'next/image';
import { MessageSquare, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface AgentCardProps {
  id: string;
  name: string;
  firm: string | null;
  avatarUrl: string | null;
  escrowCount: number;
  rating: number | null;
  isOnline: boolean;
  professionalBodies: Array<'LASRERA' | 'ESVARBON' | 'NIESV' | 'AEAN' | 'ERCAAN' | 'REDAN'>;
  onMessage: (_id: string) => void;
  variant?: 'default' | 'compact';
}

const AgentCard: React.FC<AgentCardProps> = ({
  id,
  name,
  firm,
  avatarUrl,
  escrowCount,
  rating,
  isOnline,
  professionalBodies,
  onMessage,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'bg-white border border-outline-variant rounded-card overflow-hidden transition-all duration-200 hover:border-terra hover:shadow-card',
        isCompact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar Section */}
        <div className="relative">
          <div className={cn(
            'bg-sand-warm rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm',
            isCompact ? 'w-12 h-12' : 'w-16 h-16'
          )}>
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" />
            ) : (
              <span className="text-muted font-bold text-xl">{name[0]}</span>
            )}
          </div>
          {isOnline && (
            <div className="w-4 h-4 bg-success border-2 border-white rounded-full absolute bottom-0 right-0 shadow-sm" />
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-charcoal truncate">{name}</h4>
          {firm && <p className="text-xs text-muted truncate mb-1">{firm}</p>}
          
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted">
            <div className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-terra" />
              <span>{escrowCount} Escrows</span>
            </div>
            {rating && (
              <>
                <span className="text-outline-variant">|</span>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {isCompact && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onMessage(id)}
            className="h-10 w-10 p-0 rounded-full"
          >
            <MessageSquare size={18} className="text-terra" />
          </Button>
        )}
      </div>

      {!isCompact && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {professionalBodies.slice(0, 1).map((body) => (
              <span
                key={body}
                className="bg-terra-50 text-terra-dark text-[10px] font-mono px-2 py-0.5 rounded-chip border border-terra/10"
              >
                {body}
              </span>
            ))}
            {professionalBodies.length > 1 && (
              <span className="text-[10px] font-mono text-muted px-1.5 py-0.5">
                +{professionalBodies.length - 1} more
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onMessage(id)}
            className="text-terra hover:bg-terra-50"
          >
            Message
          </Button>
        </div>
      )}
    </div>
  );
};

export { AgentCard };
