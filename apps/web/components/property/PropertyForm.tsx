'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Upload, 
  Check, 
  Plus, 
  Minus, 
  Info,
  ShieldCheck,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const LGAs = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry',
  'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe',
  'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
];

const amenities = [
  'Pool', 'Gym', '24/7 Security', 'Parking', 'Fibre Internet',
  'Generator', 'Water Supply', 'Air Conditioning', 'Smart Home', 'EV Charging'
];

const propertyTypes = ['Apartment', 'Duplex', 'Bungalow', 'Studio', 'Flat', 'Terrace'];

interface PropertyFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function PropertyForm({ initialData, onSubmit, isSubmitting }: PropertyFormProps) {
  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState(initialData || {
    title: '',
    type: 'Apartment',
    lga: 'Eti-Osa',
    address: '',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 0,
    priceYearlyKobo: 0,
    serviceChargeKobo: 0,
    depositKobo: 0,
    allowEscrow: true,
    amenities: [] as string[],
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleAmenity = (name: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(name) 
        ? f.amenities.filter(a => a !== name) 
        : [...f.amenities, name]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
              s === step ? 'bg-terra text-white shadow-lg scale-110' : 
              s < step ? 'bg-success text-white' : 'bg-white border border-outline-variant text-muted'
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
              <Input label="Property Title" placeholder="e.g. Modern 3-Bed Apartment" value={form.title} onChange={(val) => setForm({...form, title: val})} />
              <Input label="Full Address" placeholder="No. 12 Street Name, Area" value={form.address} onChange={(val) => setForm({...form, address: val})} />
              <Button variant="primary" size="lg" fullWidth onClick={nextStep}>Next Step</Button>
            </motion.div>
        )}
        {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <Input label="Yearly Price" prefix="₦" value={form.priceYearlyKobo.toString()} onChange={(val) => setForm({...form, priceYearlyKobo: parseInt(val)})} />
              <Button variant="primary" size="lg" fullWidth onClick={nextStep}>Next Step</Button>
            </motion.div>
        )}
        {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
               <h2 className="font-playfair text-xl font-bold">Amenities</h2>
               <Button variant="primary" size="lg" fullWidth onClick={nextStep}>Review</Button>
            </motion.div>
        )}
        {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <h2 className="font-playfair text-xl font-bold">Review & Publish</h2>
                <Button variant="primary" size="lg" fullWidth loading={isSubmitting} onClick={() => onSubmit(form)}>Submit Listing</Button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
