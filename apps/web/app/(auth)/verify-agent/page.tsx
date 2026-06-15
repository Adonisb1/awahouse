'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Info, Upload, ChevronDown, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TopNav } from '@/components/layout/TopNav';
import { trpc } from '@/lib/trpc/react';
import type { VerificationType } from '@awahouse/types';

const professionalBodies = [
  { id: 'LASRERA', name: 'Lagos State Real Estate Regulatory Authority' },
  { id: 'ESVARBON', name: 'Estate Surveyors and Valuers Registration Board' },
  { id: 'NIESV', name: 'Nigerian Institution of Estate Surveyors and Valuers' },
  { id: 'AEAN', name: 'Association of Estate Agents in Nigeria' },
  { id: 'ERCAAN', name: 'Estate Rent and Commission Agents Association of Nigeria' },
  { id: 'REDAN', name: 'Real Estate Developers Association of Nigeria' },
];

export default function AgentVerificationPage() {
  const router = useRouter();
  const [selectedBody, setSelectedBody] = React.useState<string | null>(null);
  const [membershipNumber, setMembershipNumber] = React.useState('');
  const [expiryMonth, setExpiryMonth] = React.useState('');
  const [expiryYear, setExpiryYear] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.verification.uploadDocument.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        if (typeof base64 !== 'string') return;
        resolve(base64.split(',')[1] ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!file || !selectedBody) return;

    try {
      setError('');
      const base64 = await readFileAsBase64(file);
      await uploadMutation.mutateAsync({
        verificationType: selectedBody.toLowerCase() as VerificationType,
        fileName: file.name,
        fileType: file.type,
        fileBase64: base64,
      });
      router.push('/agent/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Professional Verification" />

      <div className="flex-1 px-6 py-8 pb-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-playfair text-2xl font-bold text-charcoal mb-2">
            Professional Verification
          </h1>
          <p className="text-sm text-muted mb-8">
            Upload your membership certificate for manual review.
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-[14px] p-4 flex gap-3 mb-8">
          <Info className="text-blue-500 shrink-0" size={20} />
          <p className="text-sm text-blue-800 leading-relaxed">
            Select at least <span className="font-bold">ONE</span> professional body before you can list properties.
          </p>
        </div>

        {/* Professional Body Selection */}
        <div className="space-y-3 mb-8">
          <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-3">
            SELECT PROFESSIONAL BODY
          </label>
          {professionalBodies.map((body) => (
            <div
              key={body.id}
              onClick={() => setSelectedBody(body.id)}
              className={cn(
                'p-4 bg-white border-2 rounded-card transition-all duration-200 cursor-pointer flex items-center gap-3',
                selectedBody === body.id ? 'border-terra bg-terra-50 shadow-sm' : 'border-outline-variant hover:border-terra/30'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                selectedBody === body.id ? 'border-terra' : 'border-outline-variant'
              )}>
                {selectedBody === body.id && <div className="w-2.5 h-2.5 bg-terra rounded-full" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-charcoal text-sm">{body.id}</p>
                <p className="text-[10px] text-muted truncate">{body.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-6 mb-8">
          <Input
            label="MEMBERSHIP NUMBER"
            placeholder="e.g. AWA/2024/001"
            value={membershipNumber}
            onChangeValue={setMembershipNumber}
          />

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1.5">
              UPLOAD CERTIFICATE
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full h-32 border-2 border-dashed rounded-[14px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                file ? "border-success bg-success/5" : "border-outline-variant bg-white hover:bg-sand-50"
              )}
            >
              {file ? (
                <>
                  <FileText className="text-success" size={24} />
                  <p className="text-[13px] font-bold text-charcoal truncate px-4 w-full text-center">{file.name}</p>
                  <p className="text-[10px] text-success uppercase font-bold tracking-widest">File selected</p>
                </>
              ) : (
                <>
                  <Upload className="text-muted" size={24} />
                  <p className="text-[13px] font-bold text-charcoal">Drag or tap to upload</p>
                  <p className="text-[11px] text-muted">PDF, JPG, PNG · Max 10MB</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1.5">
              EXPIRY DATE
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <select
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  className="w-full h-[52px] px-4 rounded-input border border-outline-variant bg-white font-sans text-sm appearance-none outline-none focus:border-terra-dark transition-all"
                >
                  <option value="" disabled>Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
              </div>
              <div className="flex-1 relative">
                <select
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  className="w-full h-[52px] px-4 rounded-input border border-outline-variant bg-white font-sans text-sm appearance-none outline-none focus:border-terra-dark transition-all"
                >
                  <option value="" disabled>Year</option>
                  {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={uploadMutation.isPending}
          disabled={!selectedBody || !membershipNumber || !expiryMonth || !expiryYear || !file}
          onClick={handleSubmit}
          className="shadow-none"
        >
          Submit for Review
        </Button>
        <p className="text-[11px] text-center text-muted mt-3">
          Verification typically takes up to 48 hours.
        </p>
      </div>
    </div>
  );
}
