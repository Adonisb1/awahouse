'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const propertyTypes = ['Apartment', 'Duplex', 'Bungalow', 'Studio', 'Commercial'];

interface PropertyFormState {
  title: string;
  type: string;
  lga: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  priceYearlyKobo: number;
}

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (_data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function PropertyForm({ initialData, onSubmit, isSubmitting }: PropertyFormProps) {
  const [step, setStep] = React.useState(1);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = React.useState<PropertyFormState>(initialData as PropertyFormState || {
    title: '',
    type: 'Apartment',
    lga: 'Eti-Osa',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    priceYearlyKobo: 0,
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 10 - selectedFiles.length;
    const toAdd = files.slice(0, remaining);
    setSelectedFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
    if (e.target) e.target.value = '';
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-card shadow-card">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
              s === step ? 'bg-terra text-white shadow-lg scale-110' : 
              s < step ? 'bg-success text-white' : 'bg-sand text-muted'
            )}>
              {s < step ? <Check size={14} /> : s}
            </div>
            {s < 4 && (
              <div className={cn('w-8 h-[2px] transition-colors', s < step ? 'bg-success' : 'bg-outline-variant/30')} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="font-playfair text-xl font-bold text-charcoal">Basic Information</h2>
              <Input label="Property Title" placeholder="e.g. Modern 3-Bed Apartment" value={form.title} onChangeValue={(val) => setForm({...form, title: val})} className="bg-sand/30" />
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-3">Property Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setForm({...form, type})}
                      className={cn(
                        'h-10 rounded-chip border text-xs font-bold transition-all',
                        form.type === type ? 'bg-terra text-white border-terra' : 'bg-sand/30 text-muted border-outline-variant hover:bg-sand/50'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Full Address" placeholder="No. 12 Street Name, Area" value={form.address} onChangeValue={(val) => setForm({...form, address: val})} className="bg-sand/30" />
              <Button variant="primary" size="lg" fullWidth onClick={nextStep}>Next Step</Button>
            </motion.div>
        )}
        {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="font-playfair text-xl font-bold text-charcoal">Pricing Details</h2>
              <Input label="Yearly Price" prefix="₦" placeholder="4,500,000" value={(form.priceYearlyKobo ?? 0).toString()} onChangeValue={(val) => setForm({...form, priceYearlyKobo: parseInt(val) || 0})} className="bg-sand/30" />
              <Button variant="primary" size="lg" fullWidth onClick={nextStep}>Next Step</Button>
            </motion.div>
        )}
        {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
               <h2 className="font-playfair text-xl font-bold text-charcoal">Photos</h2>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 multiple
                 onChange={handleFileSelect}
                 className="hidden"
               />
               <div className="flex flex-wrap gap-3">
                 {previews.map((url, i) => (
                   <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-charcoal/10 group">
                     <img src={url} alt="" className="w-full h-full object-cover" />
                     <button
                       type="button"
                       onClick={() => removeFile(i)}
                       className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X className="h-3 w-3 text-white" />
                     </button>
                   </div>
                 ))}
                 {previews.length < 10 && (
                   <button
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="w-20 h-20 rounded-lg border-2 border-dashed border-charcoal/20 flex flex-col items-center justify-center gap-1 text-charcoal/40 hover:border-primary hover:text-primary transition-colors"
                   >
                     <Upload className="h-5 w-5" />
                     <span className="text-[10px] font-medium">Upload</span>
                   </button>
                 )}
               </div>
               {selectedFiles.length > 0 && (
                 <p className="text-xs text-charcoal/40">{selectedFiles.length} / 10 selected</p>
               )}
               <div className="flex gap-3">
                 <Button variant="secondary" size="lg" onClick={prevStep}>Back</Button>
                 <Button variant="primary" size="lg" fullWidth onClick={nextStep}>Review</Button>
               </div>
            </motion.div>
        )}
        {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <h2 className="font-playfair text-xl font-bold text-charcoal">Review & Publish</h2>
                <Button variant="primary" size="lg" fullWidth loading={isSubmitting} onClick={() => onSubmit({ ...form, selectedFiles })}>Submit Listing</Button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
