'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, User, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function AvatarUpload({ currentUrl, onUpload, onRemove }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUpload(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center text-terra relative group overflow-hidden shadow-inner">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={32} />
        )}
        <div
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={16} />
        </div>
      </div>

      <div>
        <p className="font-bold text-charcoal">Profile Photo</p>
        <p className="text-xs text-muted mt-1">High quality photos build more trust.</p>
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-terra hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {uploading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload new'
            )}
          </button>
          {currentUrl && (
            <button
              type="button"
              disabled={uploading}
              onClick={onRemove}
              className="text-xs font-bold text-red-500 hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
